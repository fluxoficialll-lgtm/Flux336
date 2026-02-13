
import { query } from '../pool.js';

/**
 * @namespace AdRepository
 * @description
 * Repositório para gerenciar os dados de Anúncios (Ads) e seus eventos.
 * Funciona como a camada de acesso a dados para tudo relacionado à publicidade,
 * interagindo diretamente com as tabelas 'ads' e 'ad_events'.
 * 
 * Principais responsabilidades:
 * - CRUD (Create, Read, Update, Delete) de anúncios.
 * - Manipulação de orçamentos de campanhas.
 * - Busca de anúncios para serem processados pelo AdService.
 * 
 * Abstrai a lógica SQL, garantindo que o resto da aplicação manipule os dados
 * de anúncios de forma segura, performática e consistente.
 */
export const AdRepository = {
    async create(ad) {
        const { id, ownerId, ...data } = ad;
        await query(`
            INSERT INTO ads (id, owner_id, data)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET data = $3
        `, [id, ownerId, JSON.stringify(data)]);
        return true;
    },

    async update(id, updates) {
        await query(`
            UPDATE ads 
            SET data = data || $2::jsonb
            WHERE id = $1
        `, [id, JSON.stringify(updates)]);
        return true;
    },

    async addBudget(id, amount) {
        await query(`
            UPDATE ads 
            SET data = jsonb_set(data, '{budget}', (COALESCE(data->>'budget', '0')::numeric + $2)::text::jsonb)
            WHERE id = $1
        `, [id, amount]);
        return true;
    },

    async delete(id) {
        await query('DELETE FROM ads WHERE id = $1', [id]);
        return true;
    },

    async findById(id) {
        const res = await query('SELECT * FROM ads WHERE id = $1', [id]);
        if (!res.rows[0]) return null;
        const row = res.rows[0];
        return {
            id: row.id,
            ownerId: row.owner_id,
            ...(typeof row.data === 'string' ? JSON.parse(row.data) : row.data)
        };
    },

    async findAll() {
        const res = await query('SELECT * FROM ads');
        return res.rows.map(row => ({
            id: row.id,
            ownerId: row.owner_id,
            ...(typeof row.data === 'string' ? JSON.parse(row.data) : row.data)
        }));
    }
};
