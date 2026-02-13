
// Importa a função 'query' do pool de conexões do banco de dados.
import { query } from '../pool.js.js';

/**
 * @namespace CredentialsRepository
 * @description
 * Repositório para gerenciar as credenciais dos provedores de pagamento (Stripe, PayPal, etc.).
 * centraliza a lógica de armazenamento e recuperação de chaves de API e outros segredos.
 * 
 * **IMPORTANTE**: As credenciais devem ser SEMPRE criptografadas antes de serem passadas para estes métodos.
 * Este repositório cuida apenas do armazenamento, não da segurança dos dados em trânsito.
 */
export const CredentialsRepository = {

    /**
     * Salva ou atualiza as credenciais de um provedor para um usuário específico.
     * Se já existirem credenciais para o usuário e provedor, elas serão substituídas.
     * @param {object} data - Os dados das credenciais.
     * @param {string} data.userId - O ID do usuário.
     * @param {string} data.provider - O nome do provedor (ex: 'stripe', 'paypal', 'snyc_pay').
     * @param {object} data.credentials - O objeto de credenciais (criptografado).
     * @returns {Promise<object>} As credenciais salvas.
     */
    async saveOrUpdate({ userId, provider, credentials }) {
        const res = await query(`
            INSERT INTO payment_provider_credentials (user_id, provider, credentials)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, provider) 
            DO UPDATE SET credentials = $3, updated_at = NOW()
            RETURNING *;
        `, [userId, provider, JSON.stringify(credentials)]);
        return res.rows[0];
    },

    /**
     * Busca as credenciais de um usuário para um provedor específico.
     * @param {object} params - Parâmetros da busca.
     * @param {string} params.userId - O ID do usuário.
     * @param {string} params.provider - O nome do provedor.
     * @returns {Promise<object|null>} O objeto de credenciais ou nulo se não encontrado.
     */
    async findByUserAndProvider({ userId, provider }) {
        const res = await query(`
            SELECT * FROM payment_provider_credentials 
            WHERE user_id = $1 AND provider = $2;
        `, [userId, provider]);
        return res.rows[0] || null;
    },

    /**
     * Busca todas as credenciais de um usuário.
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<Array<object>>} Uma lista de todas as credenciais do usuário.
     */
    async findAllByUser(userId) {
        const res = await query(`
            SELECT * FROM payment_provider_credentials WHERE user_id = $1;
        `, [userId]);
        return res.rows;
    },

    /**
     * Deleta as credenciais de um usuário para um provedor específico.
     * @param {object} params - Parâmetros da operação.
     * @param {string} params.userId - O ID do usuário.
     * @param {string} params.provider - O nome do provedor.
     * @returns {Promise<boolean>} Retorna verdadeiro se a deleção foi bem-sucedida.
     */
    async delete({ userId, provider }) {
        const res = await query(`
            DELETE FROM payment_provider_credentials 
            WHERE user_id = $1 AND provider = $2;
        `, [userId, provider]);
        return res.rowCount > 0;
    }
};
