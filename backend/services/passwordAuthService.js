
import { dbManager } from '../databaseManager.js';
import crypto from 'crypto';
import { trafficLogger } from './audit/trafficLogger.js';

async function authenticate(email, password, traceId) {
    trafficLogger.logSystem('info', '[PasswordAuthService] Iniciando autenticação', { trace_id: traceId, email });

    const user = await dbManager.users.findByEmail(email, traceId);

    if (!user) {
        trafficLogger.logSystem('warn', '[PasswordAuthService] Usuário não encontrado', { trace_id: traceId, email });
        return null;
    }

    // Em um sistema real, o hash da senha não estaria aqui.
    // Isso seria tratado por um repositório ou serviço de usuário de forma segura.
    const [salt, key] = user.password_hash.split(':');
    const derivedKey = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    if (derivedKey !== key) {
        trafficLogger.logSystem('warn', '[PasswordAuthService] Senha inválida', { trace_id: traceId, email });
        return null;
    }
    
    trafficLogger.logSystem('info', '[PasswordAuthService] Autenticação bem-sucedida', { trace_id: traceId, userId: user.id });
    return user;
}

export const passwordAuthService = {
    authenticate
};
