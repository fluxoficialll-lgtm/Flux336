
import { query } from '../pool.js';

/**
 * @namespace PaymentRepository
 * @description
 * Este repositório é o coração financeiro da plataforma.
 * Ele serve como a FONTE ÚNICA DA VERDADE para todas as transações monetárias.
 * Ao centralizar a lógica de pagamentos aqui, abstraímos a complexidade de múltiplos
 * gateways (Stripe, PayPal, etc.) e garantimos um registro de dados consistente e auditável.
 * Qualquer parte do sistema que precise registrar uma venda, um reembolso, ou consultar um
 * histórico financeiro DEVE passar por este repositório.
 */
export const PaymentRepository = {

    /**
     * Registra uma nova transação financeira no banco de dados.
     * Esta é a função mais crítica do repositório. Ela cria um registro imutável de uma transação.
     * 
     * @param {object} transactionData - Um objeto contendo os detalhes padronizados da transação.
     * @param {number} transactionData.buyerId - O ID do usuário que fez a compra.
     * @param {number} transactionData.sellerId - O ID do criador que está recebendo o dinheiro.
     * @param {number} transactionData.amount - O valor total da transação (ex: 1000 para R$10,00).
     * @param {string} transactionData.currency - A moeda da transação (ex: 'BRL', 'USD').
     * @param {string} transactionData.gateway - O provedor do pagamento (ex: 'stripe', 'paypal', 'syncpay').
     * @param {string} transactionData.gatewayTransactionId - O ID único da transação fornecido pelo gateway.
     * @param {string} transactionData.productId - Um identificador para o produto ou serviço vendido.
     * @param {string} transactionData.status - O estado inicial da transação (ex: 'completed', 'pending').
     * @returns {Promise<object>} O registro completo da transação como foi salvo no banco.
     */
    async recordTransaction(transactionData) {
        const {
            buyerId, sellerId, amount, currency, gateway,
            gatewayTransactionId, productId, status
        } = transactionData;

        const res = await query(`
            INSERT INTO payments (buyer_id, seller_id, amount, currency, gateway, gateway_transaction_id, product_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (gateway_transaction_id) DO NOTHING
            RETURNING *
        `, [buyerId, sellerId, amount, currency, gateway, gatewayTransactionId, productId, status]);

        // O ON CONFLICT garante que não haverá erro se a transação já existir.
        // Se a linha já existir, res.rows[0] será undefined.
        return res.rows[0];
    },

    /**
     * Busca uma transação específica pelo seu ID único no gateway de pagamento.
     * Essencial para a idempotência (evitar registros duplicados) em webhooks e verificações de status.
     * 
     * @param {string} gatewayTransactionId - O ID da transação no gateway.
     * @returns {Promise<object | null>} O registro do pagamento, ou null se não for encontrado.
     */
    async findTransactionByGatewayId(gatewayTransactionId) {
        const res = await query(
            'SELECT * FROM payments WHERE gateway_transaction_id = $1',
            [gatewayTransactionId]
        );
        return res.rows[0] || null;
    },

    /**
     * Atualiza o status de uma transação existente.
     * Essencial para lidar com eventos que ocorrem após a compra, como reembolsos (refunds),
     * disputas (chargebacks) ou confirmações de pagamentos que estavam pendentes.
     * 
     * @param {string} gatewayTransactionId - O ID da transação no gateway, usado como chave para encontrar o pagamento.
     * @param {string} newStatus - O novo status a ser aplicado (ex: 'refunded', 'disputed', 'confirmed').
     * @returns {Promise<object | null>} O registro do pagamento atualizado, ou null se não for encontrado.
     */
    async updateTransactionStatus(gatewayTransactionId, newStatus) {
        const res = await query(`
            UPDATE payments
            SET status = $2, updated_at = NOW()
            WHERE gateway_transaction_id = $1
            RETURNING *
        `, [gatewayTransactionId, newStatus]);

        return res.rows[0] || null;
    },

    /**
     * Busca o histórico de compras de um usuário específico.
     * Utilizado para alimentar a seção "Minhas Compras" no perfil do usuário.
     * 
     * @param {number} userId - O ID do usuário comprador.
     * @returns {Promise<Array<object>>} Uma lista com todas as transações feitas pelo usuário.
     */
    async findTransactionsByUserId(userId) {
        const res = await query(
            'SELECT * FROM payments WHERE buyer_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return res.rows;
    },

    /**
     * Busca o histórico de vendas de um criador de conteúdo.
     * Fundamental para o painel de "Meus Ganhos" do criador, permitindo que ele veja seu extrato de vendas.
     * 
     * @param {number} creatorId - O ID do usuário vendedor/criador.
     * @returns {Promise<Array<object>>} Uma lista com todas as vendas associadas ao criador.
     */
    async findTransactionsByCreatorId(creatorId) {
        const res = await query(
            'SELECT * FROM payments WHERE seller_id = $1 ORDER BY created_at DESC',
            [creatorId]
        );
        return res.rows;
    }
};
