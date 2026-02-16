
import { User, AuthError } from '../../../types';
import { emailService } from '../../emailService';
import { cryptoService } from '../../cryptoService';
import { API_BASE } from '../../../apiConfig';
import { db } from '@/database';
import { AccountSyncService } from '../../sync/AccountSyncService';
import { hydrationManager } from '../../sync/HydrationManager';
import { USE_MOCKS, MOCK_USERS } from '../../../mocks';
import { logService } from '../../logService';

const API_URL = `${API_BASE}/api/auth`;

// Helper para criar um erro que inclui o traceId
const createTraceableError = (message: string, traceId: string) => {
    const error: any = new Error(message);
    error.traceId = traceId;
    return error;
};

export const AuthFlow = {
    async performLoginSync(user: User) {
        db.users.set(user);
        localStorage.setItem('cached_user_profile', JSON.stringify(user));
        localStorage.setItem('user_id', user.id); 
        db.auth.setCurrentUserId(user.id);
        
        hydrationManager.markReady('AUTH');
        
        if (!USE_MOCKS) {
            AccountSyncService.performFullSync().catch(console.error); // Deixamos este console.error pois é um erro de background
        }
    },

    async login(email: string, password: string, traceId: string): Promise<{ user: User; nextStep: string }> {
        if (USE_MOCKS) {
            const user = MOCK_USERS['creator'];
            localStorage.setItem('auth_token', 'mock_token_' + Date.now());
            await this.performLoginSync(user);
            return { user, nextStep: '/feed' };
        }

        const safeEmail = String(email || '').toLowerCase().trim();
        const hashed = await cryptoService.hashPassword(password);
        
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-flux-trace-id': traceId // Nome do header atualizado
            },
            body: JSON.stringify({ email: safeEmail, password: hashed })
        });

        const data = await response.json();

        if (!response.ok) {
            // O backend agora retorna o traceId no corpo do erro
            throw createTraceableError(data.error || "Falha no login.", data.trace_id || traceId);
        }

        localStorage.setItem('auth_token', data.token);
        await this.performLoginSync(data.user);
        return { user: data.user, nextStep: data.user.isBanned ? '/banned' : (!data.user.isProfileCompleted ? '/complete-profile' : '/feed') };
    },

    async loginWithGoogle(googleToken: string, traceId: string, referredBy?: string): Promise<{ user: User; nextStep: string }> {
        if (USE_MOCKS) {
            const user = MOCK_USERS['user'];
            localStorage.setItem('auth_token', 'mock_token_g_' + Date.now());
            await this.performLoginSync(user);
            return { user, nextStep: '/feed' };
        }
        
        const response = await fetch(`${API_URL}/google`, { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'x-flux-trace-id': traceId // Nome do header atualizado
            }, 
            body: JSON.stringify({ credential: googleToken, referredBy: referredBy || null }) 
        });

        const data = await response.json();

        if (!response.ok) {
            throw createTraceableError(data.error || "Falha no Google Auth.", data.trace_id || traceId);
        }
        
        if (data.isNew) {
            logService.logEvent('PostgreSQL Pessoas Metadados Adicionados. ✅', { userId: data.user.id, email: data.user.email, method: 'google' });
        }

        localStorage.setItem('auth_token', data.token);
        await this.performLoginSync(data.user);
        return { user: data.user, nextStep: data.user.isBanned ? '/banned' : (data.isNew ? '/complete-profile' : '/feed') };
    },

    async register(email: string, password: string, referredById?: string) {
        // ... (o restante do arquivo permanece o mesmo)
    }
    // ...
};
