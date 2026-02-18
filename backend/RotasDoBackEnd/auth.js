
import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { OAuth2Client } from 'google-auth-library';
import { config, logger } from '../config.js';
import { passwordAuthService } from '../services/passwordAuthService.js';

const router = express.Router();

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

// Rotas de autenticação com senha
router.post('/login', passwordAuthService.login);
router.post('/register', passwordAuthService.register);

// Rota de login com Google
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    const traceId = req.traceId;

    if (!credential) {
        // O logger.logError já está aqui, o que é bom.
        const error = new Error("Credential not provided.");
        logger.logError(error, req, 'Payload de autenticação incompleto.');
        return res.status(400).json({ error: "Credential not provided.", trace_id: traceId });
    }

    if (!GOOGLE_CLIENT_ID) {
        // E aqui também.
        const error = new Error("Google Client ID not configured.");
        logger.logError(error, req, 'Tentativa de login com Google sem configuração no servidor.');
        return res.status(500).json({ error: "Authentication system not configured.", trace_id: traceId });
    }

    try {
        logger.logSystem('debug', 'Iniciando verificação de token do Google.', { traceId });
        
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

        logger.logSystem('debug', 'Token do Google verificado com sucesso.', { traceId, email: payload.email });

        const db = getFirestore();
        const usersRef = db.collection('users');

        logger.logSystem('debug', 'Consultando o banco de dados pelo usuário.', { traceId, email: payload.email });
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
            
            logger.logSystem('info', 'Novo usuário detectado. Criando perfil no banco de dados.', { 
                traceId, 
                userId: user.id, 
                email: user.email 
            });

            await newUserRef.set(user);
        } else {
            const doc = snapshot.docs[0];
            user = doc.data();

            logger.logSystem('info', 'Usuário existente encontrado. Atualizando informações de perfil.', {
                traceId,
                userId: user.id,
                email: user.email,
            });

            await doc.ref.update({ 
                name: payload.name,
                profilePicture: payload.picture 
            });
        }
        
        logger.logSystem('debug', 'Iniciando geração de token de autenticação customizado.', { traceId, userId: user.id });
        const adminAuth = getAuth();
        const customToken = await adminAuth.createCustomToken(user.id);
        logger.logSystem('debug', 'Token customizado gerado com sucesso.', { traceId, userId: user.id });

        res.status(200).json({ token: customToken, user, isNew });

    } catch (error) {
        // Este logError já captura falhas críticas no processo.
        logger.logError(error, req, 'Falha crítica na autenticação Google.');
        res.status(500).json({ error: 'Internal server error during authentication.', trace_id: traceId });
    }
});

export { router as authRoutes };
