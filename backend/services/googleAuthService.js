
import { dbManager } from '../databaseManager.js';
import { OAuth2Client } from 'google-auth-library';
import { googleAuthConfig } from '../authConfig.js';
import crypto from 'crypto';
import { trafficLogger } from './audit/trafficLogger.js';

const client = new OAuth2Client(googleAuthConfig.clientId);

async function authenticate(googleToken, traceId) {
    trafficLogger.logSystem('info', '[GoogleAuthService] Iniciando autenticação', { trace_id: traceId, hasToken: !!googleToken });

    let googleId, email, name;

    if (googleAuthConfig.clientId !== "GOOGLE_CLIENT_ID_NAO_CONFIGURADO" && googleToken && googleToken.length > 50) {
        try {
            const ticket = await client.verifyIdToken({ idToken: googleToken, audience: googleAuthConfig.clientId });
            const payload = ticket.getPayload();
            googleId = payload['sub'];
            email = payload['email'];
            name = payload['name'];
            trafficLogger.logSystem('info', '[GoogleAuthService] Token do Google verificado com sucesso', { trace_id: traceId, googleId, email });
        } catch (err) {
            trafficLogger.logSystem('warn', '[GoogleAuthService] Falha na verificação do token do Google', { trace_id: traceId, error: err.message });
        }
    }

    if (!googleId) {
        googleId = `mock_${crypto.randomUUID().substring(0, 8)}`;
        email = `guest_${googleId}@gmail.com`;
        trafficLogger.logSystem('info', '[GoogleAuthService] Gerado mock de usuário', { trace_id: traceId, googleId, email });
    }

    let user = await dbManager.users.findByGoogleId(googleId, traceId);
    let isNew = false;

    if (!user) {
        trafficLogger.logSystem('info', '[GoogleAuthService] Usuário não encontrado pelo Google ID, buscando por email', { trace_id: traceId, googleId });
        const existingByEmail = await dbManager.users.findByEmail(email, traceId);
        if (existingByEmail) {
            user = existingByEmail;
            user.googleId = googleId;
            await dbManager.users.update(user, traceId);
            trafficLogger.logSystem('info', '[GoogleAuthService] Usuário existente atualizado com Google ID', { trace_id: traceId, userId: user.id });
        } else {
            isNew = true;
            const newUser = {
                email: email.toLowerCase().trim(),
                googleId,
                isVerified: true,
                isProfileCompleted: false,
                profile: {
                    name: `user_${googleId.slice(-4)}`,
                    nickname: name || 'Usuário Flux',
                    isPrivate: false,
                    photoUrl: ''
                }
            };
            const id = await dbManager.users.create(newUser, traceId);
            user = { ...newUser, id };
            trafficLogger.logSystem('info', '[GoogleAuthService] Novo usuário criado', { trace_id: traceId, userId: user.id });
        }
    }
    
    trafficLogger.logSystem('info', '[GoogleAuthService] Autenticação concluída', { trace_id: traceId, userId: user.id, isNew });
    return { user, isNew };
}

export const googleAuthService = {
    authenticate
};
