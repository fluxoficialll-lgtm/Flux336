
import { query } from '../pool.js';

// ... (funções toUuid e mapRowToUser permanecem as mesmas)

export const UserRepository = {
    // ... (funções findByEmail, findByHandle, findById, findByGoogleId, create, e getAll permanecem as mesmas)

    async update(user) {
        // ... (código da função update existente)
    },

    /**
     * Atualiza a localização geográfica de um usuário.
     * Esta função é chamada quando o frontend envia as coordenadas do usuário.
     * Ela armazena tanto os campos numéricos quanto o tipo de dado geoespacial otimizado.
     * 
     * @param {string} userId - O ID do usuário a ser atualizado.
     * @param {number} latitude - A latitude em graus decimais.
     * @param {number} longitude - A longitude em graus decimais.
     * @returns {Promise<boolean>} Retorna true se a atualização for bem-sucedida.
     */
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
                -- Cria um ponto geográfico no padrão WGS 84 (SRID 4326)
                -- A ordem é importante: Longitude primeiro, depois Latitude.
                location = ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
            WHERE id = $3
        `;

        await query(sql, [latitude, longitude, uuid]);
        return true;
    },

    /**
     * Encontra usuários dentro de um raio específico a partir de um ponto central.
     * Esta é a função principal para a funcionalidade "Explorar por Perto".
     * Utiliza a função ST_DWithin do PostGIS para uma busca geoespacial eficiente.
     * 
     * @param {number} latitude - A latitude do ponto central.
     * @param {number} longitude - A longitude do ponto central.
     * @param {number} radiusInMeters - O raio da busca em metros.
     * @returns {Promise<Array<object>>} Uma lista de usuários encontrados dentro do raio.
     */
    async findNearby(latitude, longitude, radiusInMeters = 50000) { // Raio padrão de 50km
        if (latitude === undefined || longitude === undefined) {
            throw new Error('Latitude e longitude do ponto central são obrigatórias.');
        }

        const sql = `
            SELECT 
                id, email, handle, data, latitude, longitude,
                -- Calcula a distância em metros para cada usuário encontrado.
                ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) as distance_in_meters
            FROM 
                users
            WHERE 
                -- A condição principal: usa o índice GIST para encontrar usuários
                -- dentro do raio especificado (em metros).
                ST_DWithin(
                    location,
                    ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                    $3
                )
            ORDER BY 
                distance_in_meters ASC -- Opcional: ordenar pelos mais próximos primeiro.
            LIMIT 100; -- Evita retornar um número excessivo de resultados.
        `;

        const res = await query(sql, [latitude, longitude, radiusInMeters]);
        return res.rows.map(mapRowToUser);
    }
};

// A função mapRowToUser precisa ser atualizada para incluir os novos campos
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
        // Novos campos de localização
        latitude: row.latitude,
        longitude: row.longitude,
        distanceInMeters: row.distance_in_meters // Distância calculada na busca `findNearby`
    };
};
