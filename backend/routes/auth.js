
import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { OAuth2Client } from 'google-auth-library';
import { config, logger } from '../config.js'; // Importa a configuração centralizada e o logger

const router = express.Router();

// Usa o GOOGLE_CLIENT_ID do nosso objeto de configuração
const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Rota para expor o Client ID do Google de forma segura
router.get('/config/google-client-id', (req, res) => {
    if (GOOGLE_CLIENT_ID) {
        res.json({ clientId: GOOGLE_CLIENT_ID });
    } else {
        res.status(500).json({ error: 'Google Client ID not configured on server.' });
    }
});

// Rota de login com Google
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    const traceId = req.traceId;

    if (!credential) {
        const error = new Error("Credential not provided.");
        logger.logError(error, req, 'Payload de autenticação incompleto.');
        return res.status(400).json({ error: "Credential not provided.", trace_id: traceId });
    }

    if (!GOOGLE_CLIENT_ID) {
        const error = new Error("Google Client ID not configured.");
        logger.logError(error, req, 'Tentativa de login com Google sem configuração no servidor.');
        return res.status(500).json({ error: "Authentication system not configured.", trace_id: traceId });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        if (!payload || !payload.email) {
            const error = new Error("Invalid Google token.");
            logger.logError(error, req, 'Token do Google inválido ou sem email.');
            return res.status(401).json({ error: "Invalid Google token.", trace_id: traceId });
        }

        const db = getFirestore();
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', payload.email).limit(1).get();

        let user, isNew = false;

        if (snapshot.empty) {
            isNew = true;
            const newUserRef = usersRef.doc();
            user = {
                id: newUserRef.id,
                email: payload.email,
                name: payload.name || 'Flux User',
                profilePicture: payload.picture || 'https://example.com/default-avatar.png',
                handle: `user${newUserRef.id}`.substring(0, 15),
                createdAt: new Date().toISOString(),
                isProfileCompleted: false,
                isBanned: false,
            };
            await newUserRef.set(user);
            logger.logSystem('info', 'Novo usuário criado via Google Auth', { userId: user.id, email: user.email, traceId });
        } else {
            const doc = snapshot.docs[0];
            user = doc.data();
            await doc.ref.update({ 
                name: payload.name,
                profilePicture: payload.picture 
            });
             logger.logSystem('info', 'Usuário existente logado via Google Auth', { userId: user.id, email: user.email, traceId });
        }
        
        const adminAuth = getAuth();
        const customToken = await adminAuth.createCustomToken(user.id);

        res.status(200).json({ token: customToken, user, isNew });

    } catch (error) {
        logger.logError(error, req, 'Falha crítica na autenticação Google.');
        res.status(500).json({ error: 'Internal server error during authentication.', trace_id: traceId });
    }
});

export { router as authRoutes };
