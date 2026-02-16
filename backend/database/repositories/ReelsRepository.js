
import { query } from '../pool.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repositório para gerenciar as operações de Reels no banco de dados (PostgreSQL).
 */
export const ReelsRepository = {
    /**
     * Cria um novo Reel no banco de dados.
     * @param {object} reelData - Os dados do Reel a serem criados.
     * @returns {Promise<string>} O ID do Reel recém-criado.
     */
    async create(reelData) {
        const { userId, description, videoUrl, storagePath } = reelData;
        const id = uuidv4();
        const res = await query(
            'INSERT INTO reels (id, user_id, description, video_url, storage_path, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
            [id, userId, description, videoUrl, storagePath]
        );
        return res.rows[0].id;
    },

    /**
     * Busca um Reel pelo seu ID, incluindo os likes.
     * @param {string} reelId - O ID do Reel.
     * @returns {Promise<object|null>} O objeto do Reel ou null se não for encontrado.
     */
    async findById(reelId) {
        const res = await query(
            `SELECT r.*, 
                    (SELECT json_agg(l.user_id) FROM reel_likes l WHERE l.reel_id = r.id) as likes
             FROM reels r 
             WHERE r.id = $1`,
            [reelId]
        );
        if (res.rows.length === 0) {
            return null;
        }
        const reel = res.rows[0];
        reel.likes = reel.likes || [];
        return reel;
    },

    /**
     * Busca todos os Reels de um usuário específico.
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<Array<object>>} Uma lista de Reels do usuário.
     */
    async findByUser(userId) {
        const res = await query(
            'SELECT * FROM reels WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return res.rows;
    },

    /**
     * Atualiza um Reel.
     * @param {string} reelId - O ID do Reel a ser atualizado.
     * @param {object} updateData - Os campos a serem atualizados (ex: { description: "nova" }).
     * @returns {Promise<void>}
     */
    async update(reelId, updateData) {
        const { description } = updateData;
        await query(
            'UPDATE reels SET description = $1 WHERE id = $2',
            [description, reelId]
        );
    },

    /**
     * Deleta um Reel.
     * @param {string} reelId - O ID do Reel a ser deletado.
     * @returns {Promise<void>}
     */
    async delete(reelId) {
        await query('DELETE FROM reels WHERE id = $1', [reelId]);
    },

    /**
     * Adiciona um like a um Reel.
     * @param {string} reelId - O ID do Reel.
     * @param {string} userId - O ID do usuário que deu o like.
     * @returns {Promise<void>}
     */
    async addLike(reelId, userId) {
        await query(
            'INSERT INTO reel_likes (reel_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [reelId, userId]
        );
    }
};
