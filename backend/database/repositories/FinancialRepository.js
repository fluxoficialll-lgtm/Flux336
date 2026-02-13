// Importa a função 'query' do pool de conexões do banco de dados.
// Esta função é usada para executar todas as consultas SQL.
import { query } from '../pool.js.js';

/**
 * @namespace FinancialRepository
 * @description
 * Repositório para gerenciar todas as operações financeiras no banco de dados.
 * Inclui o registro de transações, gestão de acesso VIP, e configuração de taxas da plataforma.
 */
export const FinancialRepository = {
    /**
     * Registra uma nova transação financeira no banco de dados.
     * @param {object} transactionData - Os dados da transação.
     * @param {string} transactionData.userId - O ID do usuário que realizou a transação.
     * @param {string} transactionData.type - O tipo da transação (ex: 'sale', 'withdrawal').
     * @param {number} transactionData.amount - O valor da transação.
     * @param {string} transactionData.status - O estado atual da transação (ex: 'completed', 'pending').
     * @param {string} transactionData.providerTxId - O ID da transação no provedor de pagamento (ex: Stripe, MercadoPago).
     * @param {string} [transactionData.currency='BRL'] - A moeda da transação.
     * @param {object} [transactionData.data={}] - Dados adicionais em formato JSON.
     * @returns {Promise<string>} O ID da transação recém-criada.
     */
    async recordTransaction({ userId, type, amount, status, providerTxId, currency = 'BRL', data = {} }) {
        // Constrói a consulta SQL para inserir uma nova transação.
        const res = await query(`
            INSERT INTO financial_transactions (user_id, type, amount, status, provider_tx_id, currency, data)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
        `, [userId, type, amount, status, providerTxId, currency, JSON.stringify(data)]);
        
        // Retorna o ID da linha inserida.
        return res.rows[0].id;
    },

    /**
     * Concede ou atualiza o acesso VIP de um usuário a um grupo.
     * @param {string} userId - O ID do usuário que receberá o acesso.
     * @param {string} groupId - O ID do grupo ao qual o acesso é concedido.
     * @param {string} [status='active'] - O status do acesso (ex: 'active', 'expired').
     * @param {object} [metadata={}] - Metadados adicionais sobre o acesso.
     * @returns {Promise<boolean>} Retorna verdadeiro se a operação for bem-sucedida.
     */
    async grantVipAccess(userId, groupId, status = 'active', metadata = {}) {
        // Cria um ID de acesso único combinando o ID do usuário e do grupo.
        const accessId = `${userId}_${groupId}`;
        const data = { status, ...metadata };

        // Insere ou atualiza o registro de acesso VIP.
        // Se já existir um registro com o mesmo `accessId`, ele atualiza os dados.
        await query(`
            INSERT INTO vip_access (id, user_id, group_id, data)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE SET data = $4
        `, [accessId, userId, groupId, JSON.stringify(data)]);

        // Adiciona automaticamente o ID do usuário à lista de membros do grupo na tabela 'groups'.
        // A consulta verifica se o usuário já não é um membro antes de adicioná-lo.
        await query(`
            UPDATE groups 
            SET data = jsonb_set(data, '{memberIds}', COALESCE(data->'memberIds', '[]'::jsonb) || $2::jsonb)
            WHERE id = $1 AND NOT (data->'memberIds' ? $3)
        `, [groupId, JSON.stringify(userId), userId]);
        
        return true;
    },

    /**
     * Busca as configurações de taxas da plataforma no banco de dados.
     * @returns {Promise<object>} Um objeto contendo as configurações de taxas.
     * Se não encontrar, retorna um objeto com valores padrão.
     */
    async getFees() {
        // Busca a configuração de 'fees' na tabela de configurações da plataforma.
        const res = await query("SELECT value FROM platform_settings WHERE key = 'fees'");
        
        // Retorna o valor encontrado ou um objeto de taxas padrão se nada for encontrado.
        return res.rows[0]?.value || { sale_fee_type: "percent", sale_fee_value: 10, withdrawal_fee: 5.00 };
    },

    /**
     * Atualiza as configurações de taxas da plataforma.
     * @param {object} newFees - O novo objeto de configurações de taxas.
     * @returns {Promise<boolean>} Retorna verdadeiro se a atualização for bem-sucedida.
     */
    async updateFees(newFees) {
        // Atualiza o valor da configuração 'fees' e o timestamp de atualização.
        await query("UPDATE platform_settings SET value = $1, updated_at = NOW() WHERE key = 'fees'", [JSON.stringify(newFees)]);
        
        return true;
    }
};
