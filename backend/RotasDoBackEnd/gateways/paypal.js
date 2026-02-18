
import express from 'express';
import { paypalService } from '../../services/paypalService.js';

const router = express.Router();

// Rota para verificar o status de uma ordem no PayPal.
router.post('/check-status', async (req, res) => {
    try {
        const { orderId, sellerId } = req.body; // O ID do vendedor deve ser enviado pelo frontend

        // 1. Prevenção de Duplicidade: Verificar se a transação já foi registrada.
        const existingPayment = await req.hub.payments.findTransactionByGatewayId(orderId);
        if (existingPayment) {
            console.log(`[PayPal] Transação ${orderId} já registrada. Status: ${existingPayment.status}`);
            return res.json({ status: existingPayment.status });
        }

        // 2. Obter Credenciais do Vendedor
        const credentials = await req.hub.credentials.getCredentialsByServiceAndUser('paypal', sellerId);
        if (!credentials) {
            return res.status(401).json({ error: 'Vendedor não possui credenciais do PayPal configuradas.' });
        }

        // 3. Consultar o Status no PayPal
        const orderDetails = await paypalService.captureOrder(credentials.clientId, credentials.clientSecret, orderId);

        // A captura bem-sucedida (captureOrder) geralmente significa que o pagamento foi concluído.
        const isSuccess = orderDetails.status === 'COMPLETED';

        if (isSuccess) {
            console.log(`✅ Pagamento PayPal [${orderId}] confirmado. Registrando...`);

            // 4. Mapear e Registrar a Transação
            const buyerId = req.userId || orderDetails.metadata?.buyerId; // Prioriza usuário logado
            const purchaseUnit = orderDetails.purchase_units[0];
            const amountInCents = parseFloat(purchaseUnit.amount.value) * 100;

            if (sellerId && buyerId) {
                const transactionData = {
                    buyerId: buyerId,
                    sellerId: sellerId,
                    amount: Math.round(amountInCents), // Garante que seja um inteiro
                    currency: purchaseUnit.amount.currency_code,
                    gateway: 'paypal',
                    gatewayTransactionId: orderId,
                    productId: purchaseUnit.custom_id || 'N/A', // Usar custom_id se definido na criação da ordem
                    status: 'completed'
                };

                await req.hub.payments.recordTransaction(transactionData);
                console.log(`💾 Transação PayPal [${orderId}] registrada com sucesso.`);
            } else {
                console.error(`🚨 FALHA CRÍTICA: PayPal [${orderId}] pago, mas impossível registrar. Faltam dados do vendedor ou comprador.`);
            }
        }

        res.json({ status: orderDetails.status });

    } catch (e) {
        console.error(`[PayPal] Erro ao verificar status da ordem: ${e.message}`);
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// As outras rotas (auth-token, create-order, etc.) permanecem como estão, mas idealmente
// também seriam refatoradas para usar o req.hub e passar metadados.
router.post('/auth-token', async (req, res) => { /* ...código existente... */ });
router.post('/disconnect', async (req, res) => { /* ...código existente... */ });
router.post('/create-order', async (req, res) => { /* ...código existente... */ });

export default router;
