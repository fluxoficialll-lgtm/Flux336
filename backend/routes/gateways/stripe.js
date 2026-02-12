
import express from 'express';
import { stripeService } from '../../services/stripeService.js';
import { dbManager } from '../../databaseManager.js';

const router = express.Router();

router.post('/auth-token', async (req, res) => {
    try {
        const { secretKey } = req.body;
        const data = await stripeService.verifyCredentials(secretKey);
        res.json({ success: true, data });
    } catch (e) {
        res.status(401).json({ error: e.message });
    }
});

router.post('/disconnect', async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        const user = await dbManager.users.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const paymentConfigs = user.paymentConfigs || {};
        if (paymentConfigs.stripe) {
            paymentConfigs.stripe.isConnected = false;
            paymentConfigs.stripe.secretKey = null;
        }

        await dbManager.users.update({ id: userId, paymentConfigs });

        res.json({ success: true, message: 'Stripe desconectado com sucesso.' });
    } catch (error) {
        console.error('Erro ao desconectar Stripe:', error);
        res.status(500).json({ error: 'Falha ao desconectar o provedor.' });
    }
});

router.post('/create-session', async (req, res) => {
    try {
        const { group, ownerEmail, successUrl, cancelUrl } = req.body;
        const session = await stripeService.createCheckoutSession(group, group.creatorId, successUrl, cancelUrl);
        res.json(session);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/check-status', async (req, res) => {
    try {
        const { sessionId, ownerEmail } = req.body;
        // Lógica de verificação real via Stripe API...
        res.json({ status: 'pending' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
