
import express from 'express';
import { paypalService } from '../../services/paypalService.js';
import { dbManager } from '../../databaseManager.js';

const router = express.Router();

router.post('/auth-token', async (req, res) => {
    try {
        const { clientId, clientSecret } = req.body;
        const token = await paypalService.verifyCredentials(clientId, clientSecret);
        res.json({ success: true, token });
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
        if (paymentConfigs.paypal) {
            paymentConfigs.paypal.isConnected = false;
            paymentConfigs.paypal.clientId = null;
            paymentConfigs.paypal.clientSecret = null;
        }

        await dbManager.users.update({ id: userId, paymentConfigs });

        res.json({ success: true, message: 'PayPal desconectado com sucesso.' });
    } catch (error) {
        console.error('Erro ao desconectar PayPal:', error);
        res.status(500).json({ error: 'Falha ao desconectar o provedor.' });
    }
});

router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, description, clientId, clientSecret } = req.body;
        if (!clientId || !clientSecret) {
            return res.status(400).json({ error: "Credenciais do vendedor ausentes." });
        }
        const order = await paypalService.createOrder(clientId, clientSecret, amount, currency, description);
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/check-status', async (req, res) => {
    try {
        const { orderId, clientId, clientSecret } = req.body;
        if (!clientId || !clientSecret) {
            return res.status(400).json({ error: "Credenciais do vendedor ausentes." });
        }
        const result = await paypalService.checkStatus(clientId, clientSecret, orderId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
