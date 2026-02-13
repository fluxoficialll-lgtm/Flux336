
import { query } from '../pool.js.js';

/**
 * @namespace NotificationRepository
 * @description
 * Repositório para gerenciar notificações na plataforma.
 * Centraliza toda a lógica de acesso a dados para criar, buscar,
 * e atualizar o estado das notificações dos usuários.
 */
export const NotificationRepository = {
    /**
     * Cria uma nova notificação no banco de dados.
     * @param {object} notificationData - Os dados da notificação.
     * @param {number} notificationData.userId - O ID do usuário que receberá a notificação.
     * @param {string} notificationData.type - O tipo da notificação (ex: 'new_like', 'new_comment').
     * @param {object} notificationData.data - Um objeto JSON com detalhes (ex: { postId: 123, likedBy: 'username' }).
     * @returns {Promise<object>} A notificação criada.
     */
    async create({ userId, type, data }) {
        const res = await query(
            'INSERT INTO notifications (user_id, type, data) VALUES ($1, $2, $3) RETURNING *',
            [userId, type, data]
        );
        return res.rows[0];
    },

    /**
     * Busca todas as notificações de um usuário específico.
     * @param {number} userId - O ID do usuário.
     * @returns {Promise<Array<object>>} Uma lista de notificações.
     */
    async findByUserId(userId) {
        const res = await query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return res.rows;
    },

    /**
     * Marca uma notificação específica como lida.
     * @param {number} notificationId - O ID da notificação.
     * @returns {Promise<boolean>} Retorna true se a operação foi bem-sucedida.
     */
    async markAsRead(notificationId) {
        const res = await query(
            'UPDATE notifications SET is_read = true, updated_at = NOW() WHERE id = $1',
            [notificationId]
        );
        return res.rowCount > 0;
    },

    /**
     * Conta o número de notificações não lidas para um usuário.
     * @param {number} userId - O ID do usuário.
     * @returns {Promise<number>} O número de notificações não lidas.
     */
    async getUnreadCount(userId) {
        const res = await query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
            [userId]
        );
        return parseInt(res.rows[0].count, 10);
    }
};
