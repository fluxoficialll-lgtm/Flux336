
import express from 'express';
import { syncPayService } from '../../services/syncpayService.js.js';

const router = express.Router();

// Rota para verificar o status de uma transação com o SyncPay.
// Frequentemente chamada pelo frontend após o usuário retornar do fluxo de pagamento.
router.post('/check-status', async (req, res) => {
    try {
        const { transactionId, ownerEmail } = req.body;

        // Primeiro, e mais importante: verificar se já processamos esta transação.
        const existingPayment = await req.hub.payments.findTransactionByGatewayId(transactionId);
        if (existingPayment) {
            console.log(`[SyncPay] Transação ${transactionId} já registrada. Status: ${existingPayment.status}`);
            return res.json({ status: existingPayment.status });
        }

        // Se não foi processada, consultar o status no SyncPay.
        const token = await getPartnerTokenForSeller(ownerEmail, req.hub.credentials);
        if (!token) {
            return res.status(401).json({ error: 'Vendedor não configurado no SyncPay.' });
        }
        
        const txData = await syncPayService.getTransactionStatus(token, transactionId);
        const isSuccess = txData.status === 'completed' || txData.status === 'paid';

        // Se o pagamento foi bem-sucedido no SyncPay, registramos em nosso sistema.
        if (isSuccess) {
            console.log(`✅ Pagamento SyncPay [${transactionId}] confirmado. Registrando...`);

            const seller = await req.hub.users.findByEmail(ownerEmail);
            const buyerId = req.userId || txData.metadata?.buyerId; // Prioriza usuário logado.

            if (seller && buyerId) {
                // Mapeia os dados do SyncPay para o nosso formato padrão.
                const transactionData = {
                    buyerId: buyerId,
                    sellerId: seller.id,
                    amount: txData.amount, // Valor em centavos
                    currency: txData.currency || 'BRL',
                    gateway: 'syncpay',
                    gatewayTransactionId: transactionId,
                    productId: txData.identifier || 'N/A',
                    status: 'completed'
                };

                // Usa o repositório centralizado para gravar a transação.
                await req.hub.payments.recordTransaction(transactionData);
                console.log(`💾 Transação SyncPay [${transactionId}] registrada com sucesso.`);
            } else {
                console.error(`🚨 FALHA CRÍTICA: SyncPay [${transactionId}] pago, mas impossível registrar. Faltam dados do vendedor ou comprador.`);
            }
        }

        res.json({ status: txData.status });

    } catch (e) {
        console.error(`[SyncPay] Erro ao verificar status: ${e.message}`);
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// Helper para obter o token do vendedor, agora usando o hub de repositórios.
async function getPartnerTokenForSeller(sellerEmail, credentialsRepo) {
    const credentials = await credentialsRepo.getCredentialsByServiceAndEmail('syncpay', sellerEmail);
    return credentials?.token;
}

// As outras rotas (auth-token, disconnect, etc.) podem ser refatoradas similarmente, se necessário.
router.post('/auth-token', async (req, res) => { /* ...código existente... */ });
router.post('/disconnect', async (req, res) => { /* ...código existente... */ });
router.post('/cash-in', async (req, res) => { /* ...código existente... */ });
router.post('/balance', async (req, res) => { /* ...código existente... */ });

export default router;
