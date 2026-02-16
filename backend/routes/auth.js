
import express from 'express';
import jwt from 'jsonwebtoken';
import { googleAuthService } from '../services/googleAuthService.js';
import { passwordAuthService } from '../services/passwordAuthService.js';
import { trafficLogger } from '../services/audit/trafficLogger.js';

const router = express.Router();

router.get('/config', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
});

router.post('/login', async (req, res, next) => {
    // O traceId é garantido pelo traceMiddleware
    const { traceId } = req;
    trafficLogger.logSystem('info', 'Iniciando fluxo de login por senha', { trace_id: traceId, email: req.body.email });

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        const user = await passwordAuthService.authenticate(email, password, traceId);

        if (!user) {
            trafficLogger.logSystem('warn', 'Falha na autenticação por senha', { trace_id: traceId, email });
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        const nextStep = user.isBanned ? '/banned' : (!user.isProfileCompleted ? '/complete-profile' : '/feed');
        
        trafficLogger.logSystem('info', 'Login por senha bem-sucedido', { trace_id: traceId, userId: user.id, nextStep });
        res.json({ user, token, nextStep });

    } catch (error) {
        // O erro já é logado globalmente, mas podemos adicionar um log específico aqui se necessário
        next(error); // Passa para o error handler global
    }
});

router.post('/google', async (req, res, next) => {
    // O traceId é garantido pelo traceMiddleware
    const { traceId } = req;
    trafficLogger.logSystem('info', 'Iniciando fluxo de login com Google', { trace_id: traceId });

    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "Credencial do Google não fornecida." });
        }

        const { user, isNew } = await googleAuthService.authenticate(credential, traceId);

        if (!user) {
            trafficLogger.logSystem('warn', 'Falha na autenticação com Google', { trace_id: traceId });
            return res.status(401).json({ message: "Falha na autenticação com o Google." });
        }

        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        const nextStep = isNew || !user.isProfileCompleted ? '/complete-profile' : '/feed';

        trafficLogger.logSystem('info', 'Login com Google bem-sucedido', { trace_id: traceId, userId: user.id, isNew, nextStep });
        res.json({ user, token, nextStep, isNew });

    } catch (error) {
        next(error); // Passa para o error handler global
    }
});

export default router;
