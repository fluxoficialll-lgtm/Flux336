
import express from 'express';
import { stripeService } from '../../services/stripeService.js';
import { dbManager } from '../../databaseManager.js';

const router = express.Router();

// Rota para o webhook do Stripe. É aqui que o Stripe nos notifica sobre eventos.
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Usa o serviço do Stripe para construir o evento, verificando a assinatura.
        // A chave do webhook endpoint secret precisa estar nas variáveis de ambiente.
        event = await stripeService.constructWebhookEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`❌ Erro na verificação da assinatura do webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Se o evento for a conclusão de um checkout, a mágica acontece aqui.
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('✅ Webhook: Sessão de checkout concluída recebida!', session.id);

        try {
            // Prepara os dados da transação em um formato padronizado.
            const transactionData = {
                buyerId: session.metadata.buyerId,       // Metadados que definimos ao criar a sessão
                sellerId: session.metadata.sellerId,      // Metadados que definimos ao criar a sessão
                amount: session.amount_total,           // Valor total em centavos
                currency: session.currency.toUpperCase(),
                gateway: 'stripe',
                gatewayTransactionId: session.id,          // ID da sessão de checkout do Stripe
                productId: session.metadata.productId,  // Metadados que definimos
                status: 'completed'
            };

            // Chama o PaymentRepository para registrar a transação.
            // Esta é a conexão que estávamos procurando!
            const paymentRecord = await req.hub.payments.recordTransaction(transactionData);

            console.log('💾 Transação registrada com sucesso no banco de dados! ID do pagamento:', paymentRecord.id);

            // Futuramente, aqui você pode disparar outros eventos, como:
            // - Adicionar o usuário a um grupo VIP.
            // - Enviar uma notificação para o vendedor.
            // - Etc.

        } catch (dbError) {
            console.error('🚨 FALHA CRÍTICA: Erro ao registrar a transação no banco de dados após confirmação do Stripe:', dbError);
            // Se falhar aqui, precisamos de um alerta urgente, pois o cliente pagou
            // mas o produto/serviço não foi entregue/registrado.
            return res.status(500).json({ error: 'Erro interno ao processar o pagamento.' });
        }
    }

    // Responde ao Stripe com 200 OK para confirmar o recebimento do evento.
    res.status(200).json({ received: true });
});

router.post('/create-session', async (req, res) => {
    try {
        const { group, successUrl, cancelUrl } = req.body;
        
        // Pegamos o ID do comprador a partir do token de autenticação.
        const buyerId = req.userId;

        if (!buyerId) {
            return res.status(401).json({ error: 'Usuário comprador não autenticado.' });
        }

        // Adicionamos os metadados que serão recuperados no webhook.
        const metadata = {
            buyerId: buyerId,
            sellerId: group.creatorId,
            productId: `group-${group.id}` // Exemplo de um ID de produto
        };

        const session = await stripeService.createCheckoutSession(group, metadata, successUrl, cancelUrl);
        res.json(session);
    } catch (e) {
        console.error('Erro ao criar sessão de checkout:', e);
        res.status(500).json({ error: e.message });
    }
});

// As outras rotas (auth-token, disconnect, etc.) permanecem como estão.
router.post('/auth-token', async (req, res) => { /* ...código existente... */ });
router.post('/disconnect', async (req, res) => { /* ...código existente... */ });
router.post('/check-status', async (req, res) => { /* ...código existente... */ });

export default router;
