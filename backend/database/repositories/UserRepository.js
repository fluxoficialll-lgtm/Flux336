
import { query } from '../pool.js';

const toUuid = (val) => (val === "" || val === "undefined" || val === "null") ? null : val;

const mapRowToUser = (row) => {
    if (!row) return null;
    const metadata = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
    
    return {
        ...metadata,
        id: row.id,
        email: row.email,
        handle: row.handle,
        googleId: row.google_id,
        walletBalance: parseFloat(row.wallet_balance || 0),
        isBanned: row.is_banned,
        isProfileCompleted: row.is_profile_completed,
        trustScore: row.trust_score,
        strikes: row.strikes,
        referredById: row.referred_by_id,
        createdAt: row.created_at,
        latitude: row.latitude,
        longitude: row.longitude,
        distanceInMeters: row.distance_in_meters
    };
};

export const UserRepository = {
    async findByEmail(email) {
        if (!email) return null;
        const res = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        return mapRowToUser(res.rows[0]);
    },

    async findByHandle(handle) {
        if (!handle) return null;
        const res = await query('SELECT * FROM users WHERE handle = $1', [handle.toLowerCase().trim()]);
        return mapRowToUser(res.rows[0]);
    },

    async findById(id) {
        const uuid = toUuid(id);
        if (!uuid) return null;
        const res = await query('SELECT * FROM users WHERE id = $1', [uuid]);
        return mapRowToUser(res.rows[0]);
    },

    async findByGoogleId(googleId) {
        if (!googleId) return null;
        const res = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        return mapRowToUser(res.rows[0]);
    },

    async searchByTerm(term) {
        if (!term || term.trim() === '') {
            return [];
        }
        const searchTerm = `%${term.toLowerCase().trim()}%`;
        const res = await query(
            'SELECT id, email, handle, data, is_profile_completed FROM users WHERE handle ILIKE $1 OR email ILIKE $1 ORDER BY handle ASC LIMIT 25',
            [searchTerm]
        );
        return res.rows.map(mapRowToUser);
    },

    async create(userData) {
        const { email, password_hash, googleId, handle, ...otherData } = userData;

        const columns = ['email'];
        const values = [email.toLowerCase().trim()];

        if (password_hash) {
            columns.push('password_hash');
            values.push(password_hash);
        }

        if (googleId) {
            columns.push('google_id');
            values.push(googleId);
        }

        if (handle) {
            columns.push('handle');
            values.push(handle.toLowerCase().trim());
        }
        
        const dataString = JSON.stringify(otherData);
        if (dataString !== '{}') {
            columns.push('data');
            values.push(dataString);
        }

        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');

        const res = await query(
            `INSERT INTO users (${columnNames}) VALUES (${placeholders}) RETURNING id`,
            values
        );
        return res.rows[0].id;
    },

    async update(user) {
        const { id, handle, walletBalance, isBanned, strikes, trustScore, isProfileCompleted, ...metadata } = user;
        const uuid = toUuid(id);
        
        const sql = `
            UPDATE users SET 
                handle = COALESCE($1, handle),
                wallet_balance = COALESCE($2, wallet_balance),
                is_banned = COALESCE($3, is_banned),
                strikes = COALESCE($4, strikes),
                trust_score = COALESCE($5, trust_score),
                is_profile_completed = COALESCE($6, is_profile_completed),
                data = data || $7::jsonb
            WHERE id = $8
        `;

        await query(sql, [
            handle || null,
            walletBalance !== undefined ? parseFloat(walletBalance) : null,
            isBanned !== undefined ? isBanned : null,
            strikes !== undefined ? parseInt(strikes) : null,
            trustScore !== undefined ? parseInt(trustScore) : null,
            isProfileCompleted !== undefined ? isProfileCompleted : null,
            JSON.stringify(metadata),
            uuid
        ]);
        return true;
    },

    async clearProviderConnection(userId, provider) {
        const uuid = toUuid(userId);
        if (!uuid || !provider) {
            throw new Error('User ID and provider are required.');
        }

        const pathToRemove = ['paymentConfigs', provider];

        const sql = `
            UPDATE users
            SET data = data #- $2::text[]
            WHERE id = $1
        `;

        await query(sql, [uuid, pathToRemove]);
        return true;
    },

    async getAll() {
        const res = await query('SELECT * FROM users ORDER BY created_at DESC LIMIT 1000');
        return res.rows.map(mapRowToUser);
    },

    async updateLocation(userId, latitude, longitude) {
        const uuid = toUuid(userId);
        if (!uuid || latitude === undefined || longitude === undefined) {
            throw new Error('ID do usuário, latitude e longitude são obrigatórios.');
        }

        const sql = `
            UPDATE users
            SET 
                latitude = $1,
                longitude = $2,
                location = ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
            WHERE id = $3
        `;

        await query(sql, [latitude, longitude, uuid]);
        return true;
    },

    async findNearby(latitude, longitude, radiusInMeters = 50000) { 
        if (latitude === undefined || longitude === undefined) {
            throw new Error('Latitude e longitude do ponto central são obrigatórias.');
        }

        const sql = `
            SELECT 
                id, email, handle, data, latitude, longitude,
                ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) as distance_in_meters
            FROM 
                users
            WHERE 
                ST_DWithin(
                    location,
                    ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                    $3
                )
            ORDER BY 
                distance_in_meters ASC
            LIMIT 100;
        `;

        const res = await query(sql, [latitude, longitude, radiusInMeters]);
        return res.rows.map(mapRowToUser);
    }
};
