
import express from 'express';
import { passwordAuthService } from '../services/passwordAuthService.js';
import { googleAuthService } from '../services/googleAuthService.js';
import { googleAuthConfig } from '../authConfig.js';
import { dbManager } from '../databaseManager.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/config', (req, res) => {
    res.json({ clientId: googleAuthConfig.clientId });
});

router.post('/register', async (req, res) => {
    try {
        const user = await passwordAuthService.registerUser(req.body);
        res.json({ success: true, user });
    } catch (e) {
        console.error("Register Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dbManager.users.findByEmail(email);

        // TODO: Implementar a verificação de hash da senha
        if (user && user.password_hash) { // Verificar se o hash existe
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ua = req.headers['user-agent'];
            await dbManager.admin.recordIp(user.id, ip, ua);
            res.json({ user, token: 'session_' + crypto.randomUUID() });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/google', async (req, res) => {
    try {
        const { googleToken } = req.body;
        const { user, isNew } = await googleAuthService.authenticate(googleToken);
        
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        await dbManager.admin.recordIp(user.id, ip, ua);

        res.json({ user, token: 'g_session_' + crypto.randomUUID(), isNew });
    } catch (e) {
        console.error("Google Auth Error:", e.message);
        res.status(500).json({ error: "Erro na autenticação." });
    }
});

export default router;
