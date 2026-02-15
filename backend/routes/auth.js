
import express from 'express';
import jwt from 'jsonwebtoken';
import { googleAuthService } from '../services/googleAuthService.js';

const router = express.Router();

// Rota para fornecer configurações de autenticação para o frontend.
router.get('/config', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
});

// Rota para lidar com o callback de login do Google.
// Isso resolve o erro 404 em POST /auth/google.
router.post('/google', async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "Credencial do Google não fornecida." });
        }

        // 1. Autenticar com o serviço do Google, que encontra ou cria o usuário.
        const { user, isNew } = await googleAuthService.authenticate(credential);

        if (!user) {
            return res.status(401).json({ message: "Falha na autenticação com o Google." });
        }

        // 2. Gerar um token JWT para criar a sessão do usuário.
        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 3. Determinar para onde o usuário deve ser redirecionado.
        const nextStep = isNew || !user.isProfileCompleted ? '/complete-profile' : '/feed';

        // 4. Enviar a resposta esperada pelo frontend.
        res.json({ user, token, nextStep });

    } catch (error) {
        console.error("Erro no login com Google:", error);
        next(error);
    }
});

export default router;
