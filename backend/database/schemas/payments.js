
/**
 * @file Define o schema da tabela `payments`.
 * Esta tabela é a fonte da verdade para todas as transações financeiras na plataforma.
 */
export const paymentsSchema = `
    CREATE TABLE IF NOT EXISTS payments (
        -- Coluna de identificação única para cada registro de pagamento.
        id SERIAL PRIMARY KEY,

        -- Chaves estrangeiras que ligam a transação ao comprador e ao vendedor.
        -- Usamos UUID para corresponder ao tipo da coluna 'id' na tabela 'users'.
        buyer_id UUID NOT NULL REFERENCES users(id),
        seller_id UUID NOT NULL REFERENCES users(id),

        -- Detalhes financeiros da transação.
        -- 'amount' é armazenado como um inteiro (ex: 1000 para R$10,00) para evitar problemas de arredondamento com ponto flutuante.
        amount INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL, -- Ex: 'BRL', 'USD'

        -- Detalhes do gateway de pagamento para rastreamento e auditoria.
        gateway VARCHAR(50) NOT NULL, -- Ex: 'stripe', 'paypal'
        gateway_transaction_id VARCHAR(255) UNIQUE NOT NULL, -- ID único do pagamento no provedor, essencial para evitar duplicatas e para atualizações (webhooks).

        -- Informações sobre o que foi comprado.
        product_id VARCHAR(255), -- ID do post, do grupo VIP, etc.

        -- Estado atual do ciclo de vida do pagamento.
        status VARCHAR(50) NOT NULL, -- Ex: 'completed', 'pending', 'refunded', 'disputed'

        -- Timestamps automáticos para registro e auditoria.
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Índices para otimizar as consultas mais comuns que o PaymentRepository fará.
    CREATE INDEX IF NOT EXISTS idx_payments_buyer_id ON payments(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_payments_seller_id ON payments(seller_id);
    CREATE INDEX IF NOT EXISTS idx_payments_gateway_id ON payments(gateway_transaction_id);
`;
