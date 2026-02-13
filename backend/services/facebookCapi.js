
import crypto from 'crypto';
import { dbManager } from '../databaseManager.js.js'; 

const FB_API_VERSION = 'v19.0';

// Regex para detectar dados inválidos comuns
const INVALID_PHONES = [
    /^(\d)\1+$/, 
    /11999999999/,
    /00000000000/,
    /123456789/
];

const INVALID_EMAILS = [
    'teste@teste.com',
    'admin@admin.com',
    'user@example.com',
    'usuario@gmail.com'
];

/**
 * Normaliza e gera Hash SHA-256 conforme documentação do Meta.
 * Implementa remoção de acentos para maximizar Match Quality.
 */
const hashData = (data, type = 'default') => {
    if (data === undefined || data === null || data === '') return undefined;
    
    if (typeof data === 'string' && /^[a-f0-9]{64}$/i.test(data)) {
        return data.toLowerCase();
    }

    // 1. Normalização Global: Lowercase e Trim
    let normalized = String(data).trim().toLowerCase();

    // 2. Remoção de Acentos e Cedilhas (Normalização NFD)
    // Transforma "São Paulo" em "Sao Paulo"
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (type === 'email') {
        normalized = normalized.replace(/\s/g, '');
        if (INVALID_EMAILS.includes(normalized)) return undefined;
    } 
    else if (type === 'phone') {
        normalized = normalized.replace(/\D/g, '');
        if (normalized.length < 7) return undefined;
        if (INVALID_PHONES.some(regex => regex.test(normalized))) return undefined;
        if (normalized.startsWith('0')) normalized = normalized.substring(1);
        if (normalized.length >= 10 && normalized.length <= 11) normalized = '55' + normalized;
    } 
    else if (type === 'country' || type === 'state') {
        normalized = normalized.substring(0, 2);
    }
    else if (type === 'zip') {
        normalized = normalized.replace(/\D/g, '');
    }
    else if (type === 'city') {
        // Remove pontuações mas mantém letras limpas
        normalized = normalized.replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    }
    else if (type === 'gender') {
        const first = normalized.charAt(0);
        normalized = (first === 'm' || first === 'f') ? first : '';
    }
    else if (type === 'dob') {
        const nums = normalized.replace(/\D/g, '');
        if (nums.length === 8) {
            const first4 = parseInt(nums.substring(0, 4));
            if (first4 > 1900 && first4 < 2100) {
                normalized = nums;
            } else {
                const d = nums.substring(0, 2);
                const m = nums.substring(2, 4);
                const y = nums.substring(4, 8);
                normalized = `${y}${m}${d}`;
            }
        } else {
            return undefined;
        }
    }

    if (normalized === '') return undefined;
    return crypto.createHash('sha256').update(normalized).digest('hex');
};

export const facebookCapi = {
    hashData,
    sendEvent: async ({ pixelId, accessToken, eventName, eventData, userData, eventId, url, testEventCode }) => {
        if (!pixelId || !accessToken) return;

        const currentTimestamp = Math.floor(Date.now() / 1000);

        const ensureHashArray = (val, type) => {
            if (!val) return undefined;
            if (Array.isArray(val)) {
                const hashedArr = val.map(v => hashData(v, type)).filter(Boolean);
                const unique = [...new Set(hashedArr)];
                return unique.length > 0 ? unique : undefined;
            }
            const hashed = hashData(val, type);
            return hashed ? [hashed] : undefined;
        };

        const user_data = {
            em: ensureHashArray(userData.email, 'email'),
            ph: ensureHashArray(userData.phone, 'phone'),
            fn: ensureHashArray(userData.firstName),
            ln: ensureHashArray(userData.lastName),
            ct: ensureHashArray(userData.city, 'city'),
            st: ensureHashArray(userData.state, 'state'),
            zp: ensureHashArray(userData.zip, 'zip'),
            country: ensureHashArray(userData.country, 'country'),
            external_id: ensureHashArray(userData.externalId),
            client_ip_address: userData.ip || userData.client_ip_address,
            client_user_agent: userData.userAgent || userData.client_user_agent,
            fbp: userData.fbp,
            fbc: userData.fbc
        };

        const payload = {
            data: [{
                event_name: eventName,
                event_time: currentTimestamp,
                event_source_url: url,
                event_id: eventId,
                action_source: "website",
                user_data: Object.fromEntries(Object.entries(user_data).filter(([_, v]) => v !== undefined)),
                custom_data: {
                    ...eventData,
                    currency: eventData.currency ? String(eventData.currency).toUpperCase() : undefined,
                    value: eventData.value !== undefined ? Number(eventData.value) : undefined
                }
            }]
        };

        if (testEventCode) payload.test_event_code = testEventCode;

        try {
            const fbUrl = `https://graph.facebook.com/${FB_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;
            const response = await fetch(fbUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error(`[CAPI Error] ${eventName}:`, error.message);
            throw error;
        }
    }
};
