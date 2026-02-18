
import express from 'express';
import { dbManager } from '../databaseManager.js';
import { FeeEngine } from '../services/financial/FeeEngine.js';
import { NotificationEmitter } from '../services/socket/NotificationEmitter.js';
import { facebookCapi } from '../services/facebookCapi.js';

const router = express.Router();

router.post('/process-sale-success', async (req, res) => {
    try {
        const { transactionId, grossAmount, provider, method, sellerId, groupId, country, currency, buyerEmail, userData } = req.body;

        const breakdown = await FeeEngine.calculateTransaction(grossAmount, sellerId, {
            provider,
            method,
            country
        });

        // 1. Registro Financeiro
        await dbManager.financial.recordTransaction({
            userId: sellerId,
            type: 'sale',
            amount: breakdown.netAmount,
            status: 'paid',
            providerTxId: transactionId,
            currency: currency || 'BRL',
            data: {
                originalGross: grossAmount,
                platformProfit: breakdown.platformFee,
                groupId,
                provider,
                method
            }
        });

        // 2. DISPARO DE EVENTO PURCHASE (BLINDAGEM CAPI)
        // Buscamos o pixel do vendedor para atribuir a venda corretamente
        const seller = await dbManager.users.findById(sellerId);
        const group = await dbManager.groups.findById(groupId);

        if (seller && seller.marketingConfig?.pixelId && seller.marketingConfig?.pixelToken) {
            try {
                await facebookCapi.sendEvent({
                    pixelId: seller.marketingConfig.pixelId,
                    accessToken: seller.marketingConfig.pixelToken,
                    eventName: 'Purchase',
                    eventId: `pur_${transactionId}`,
                    url: `${process.env.APP_URL}/vip-group-sales/${groupId}`,
                    eventData: {
                        value: grossAmount,
                        currency: currency || 'BRL',
                        content_ids: [groupId],
                        content_type: 'product_group',
                        content_name: group?.name || 'Venda VIP'
                    },
                    userData: {
                        email: buyerEmail,
                        ip: req.ip,
                        userAgent: req.headers['user-agent'],
                        ...userData // Dados técnicos vindos do front (fbp, fbc)
                    }
                });
                console.log(`✅ [CAPI] Purchase disparado para o pixel do vendedor: ${seller.marketingConfig.pixelId}`);
            } catch (capiErr) {
                console.warn(`⚠️ [CAPI] Falha ao enviar Purchase: ${capiErr.message}`);
            }
        }

        // 3. Notificação Real-time
        if (req.io && buyerEmail && groupId) {
            NotificationEmitter.emitPaymentSuccess(req.io, buyerEmail, groupId, group?.name || 'VIP');
        }

        res.json({ success: true, breakdown });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Rota para desconectar um provedor de pagamento e apagar as credenciais
router.post('/disconnect-provider', async (req, res) => {
    try {
        const { provider } = req.body;
        // Assume-se que um middleware de autenticação preenche `req.user`
        const userId = req.user?.id; 

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        if (!provider) {
            return res.status(400).json({ error: 'É necessário especificar o provedor.' });
        }

        // A lógica de remoção segura deve estar encapsulada no dbManager.
        // Esta função deve remover/anular as credenciais do provedor para o usuário.
        await dbManager.users.clearProviderConnection(userId, provider);

        res.status(200).json({ success: true, message: 'Provedor desconectado com sucesso.' });

    } catch (error) {
        console.error('Erro ao desconectar o provedor:', error);
        res.status(500).json({ error: 'Falha ao desconectar o provedor.' });
    }
});


export default router;
