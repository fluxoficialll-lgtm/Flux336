
import { query } from '../pool.js';
import { trafficLogger } from '../../services/audit/trafficLogger.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toUuid = (val) => {
    if (!val || typeof val !== 'string') return null;
    const cleanedVal = val.trim();
    return UUID_REGEX.test(cleanedVal) ? cleanedVal : null;
};

const mapRowToUser = (row) => {
    if (!row) return null;
    const data = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
    
    return {
        id: row.id,
        email: row.email,
        handle: row.handle,
        googleId: row.google_id,
        isProfileCompleted: row.is_profile_completed,
        createdAt: row.created_at,
        ...data
    };
};

export const UserRepository = {
    async findByEmail(email, traceId) {
        if (!email) return null;
        const sql = 'SELECT * FROM users WHERE email = $1';
        const params = [email.toLowerCase().trim()];
        trafficLogger.logSystem('info', '[UserRepository] Executing findByEmail', { trace_id: traceId, sql, params });
        const res = await query(sql, params);
        const user = mapRowToUser(res.rows[0]);
        trafficLogger.logSystem('info', '[UserRepository] Result findByEmail', { trace_id: traceId, found: !!user });
        return user;
    },

    async findByHandle(handle, traceId) {
        if (!handle) return null;
        const sql = 'SELECT * FROM users WHERE handle = $1';
        const params = [handle.toLowerCase().trim()];
        trafficLogger.logSystem('info', '[UserRepository] Executing findByHandle', { trace_id: traceId, sql, params });
        const res = await query(sql, params);
        return mapRowToUser(res.rows[0]);
    },

    async findById(id, traceId) {
        const uuid = toUuid(id);
        if (!uuid) return null;
        const sql = 'SELECT * FROM users WHERE id = $1';
        const params = [uuid];
        trafficLogger.logSystem('info', '[UserRepository] Executing findById', { trace_id: traceId, sql, params });
        const res = await query(sql, params);
        return mapRowToUser(res.rows[0]);
    },

    async findByGoogleId(googleId, traceId) {
        if (!googleId) return null;
        const sql = 'SELECT * FROM users WHERE google_id = $1';
        const params = [googleId];
        trafficLogger.logSystem('info', '[UserRepository] Executing findByGoogleId', { trace_id: traceId, sql, params });
        const res = await query(sql, params);
        const user = mapRowToUser(res.rows[0]);
        trafficLogger.logSystem('info', '[UserRepository] Result findByGoogleId', { trace_id: traceId, found: !!user });
        return user;
    },

    async searchByTerm(term, traceId) {
        if (!term || term.trim() === '') {
            return [];
        }
        const searchTerm = `%${term.toLowerCase().trim()}%`;
        const sql = 'SELECT id, email, handle, data, is_profile_completed FROM users WHERE handle ILIKE $1 OR email ILIKE $1 ORDER BY handle ASC LIMIT 25';
        const params = [searchTerm];
        trafficLogger.logSystem('info', '[UserRepository] Executing searchByTerm', { trace_id: traceId, sql, params });
        const res = await query(sql, params);
        return res.rows.map(mapRowToUser);
    },

    async create(userData, traceId) {
        const { email, password_hash, google_id, handle, is_profile_completed, ...data } = userData;

        const columns = ['email'];
        const values = [email.toLowerCase().trim()];

        if (password_hash) { columns.push('password_hash'); values.push(password_hash); }
        if (google_id) { columns.push('google_id'); values.push(google_id); }
        if (handle) { columns.push('handle'); values.push(handle.toLowerCase().trim()); }
        if (is_profile_completed !== undefined) { columns.push('is_profile_completed'); values.push(is_profile_completed); }
        
        columns.push('data');
        values.push(JSON.stringify(data));

        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');
        
        const sql = `INSERT INTO users (${columnNames}) VALUES (${placeholders}) RETURNING id`;
        trafficLogger.logSystem('info', '[UserRepository] Executing create', { trace_id: traceId, sql, values });

        const res = await query(sql, values);
        const newId = res.rows[0].id;
        trafficLogger.logSystem('info', '[UserRepository] Result create', { trace_id: traceId, newId });
        return newId;
    },

    async update(user, traceId) {
        const { id, handle, is_profile_completed, ...data } = user;
        const uuid = toUuid(id);
        
        const sql = `
            UPDATE users SET 
                handle = COALESCE($1, handle),
                is_profile_completed = COALESCE($2, is_profile_completed),
                data = data || $3::jsonb
            WHERE id = $4
        `;
        const params = [
            handle || null,
            is_profile_completed !== undefined ? is_profile_completed : null,
            JSON.stringify(data),
            uuid
        ];
        trafficLogger.logSystem('info', '[UserRepository] Executing update', { trace_id: traceId, sql, params });

        await query(sql, params);
        trafficLogger.logSystem('info', '[UserRepository] Result update', { trace_id: traceId, updated: true, userId: uuid });
        return true;
    },

    async getAll(traceId) {
        const sql = 'SELECT * FROM users ORDER BY created_at DESC LIMIT 1000';
        trafficLogger.logSystem('info', '[UserRepository] Executing getAll', { trace_id: traceId, sql });
        const res = await query(sql);
        return res.rows.map(mapRowToUser);
    }
};
