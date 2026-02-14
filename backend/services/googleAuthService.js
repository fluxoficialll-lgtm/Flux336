
import { dbManager } from '../databaseManager.js';
import { OAuth2Client } from 'google-auth-library';
import { googleAuthConfig } from '../authConfig.js';
import crypto from 'crypto';

const client = new OAuth2Client(googleAuthConfig.clientId);

async function authenticate(googleToken) {
    let googleId, email, name;

    if (googleAuthConfig.clientId !== "GOOGLE_CLIENT_ID_NAO_CONFIGURADO" && googleToken && googleToken.length > 50) {
        try {
            const ticket = await client.verifyIdToken({ idToken: googleToken, audience: googleAuthConfig.clientId });
            const payload = ticket.getPayload();
            googleId = payload['sub'];
            email = payload['email'];
            name = payload['name'];
        } catch (err) {
            console.warn("Falha na verificação do token do Google:", err.message);
        }
    }

    if (!googleId) {
        googleId = `mock_${crypto.randomUUID().substring(0, 8)}`;
        email = `guest_${googleId}@gmail.com`;
    }

    let user = await dbManager.users.findByGoogleId(googleId);
    let isNew = false;

    if (!user) {
        const existingByEmail = await dbManager.users.findByEmail(email);
        if (existingByEmail) {
            user = existingByEmail;
            user.googleId = googleId;
            await dbManager.users.update(user);
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
            const id = await dbManager.users.create(newUser);
            user = { ...newUser, id };
        }
    }
    
    return { user, isNew };
}

export const googleAuthService = {
    authenticate
};
