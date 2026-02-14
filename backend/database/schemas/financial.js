
export const financialSchema = `
    -- 📝 Cria um tipo enumerado para os tipos de transação.
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'purchase', 'refund', 'fee', 'payout');
    -- 📝 Cria um tipo enumerado para os status da transação.
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

    -- 📝 Tabela para registrar todas as transações financeiras na plataforma.
    CREATE TABLE IF NOT EXISTS transactions (
        -- 📝 ID único para a transação.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário associado à transação.
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 Tipo da transação, usando o tipo enumerado 'transaction_type'.
        type transaction_type NOT NULL,
        -- 📝 Status atual da transação, usando o tipo enumerado 'transaction_status'.
        status transaction_status NOT NULL DEFAULT 'pending',
        -- 📝 Valor monetário da transação.
        amount NUMERIC(15, 2) NOT NULL,
        -- 📝 Moeda da transação (ex: 'BRL', 'USD').
        currency VARCHAR(3) NOT NULL,
        -- 📝 Descrição da transação.
        description TEXT,
        -- 📝 ID da entidade relacionada (ex: ID do produto, ID da assinatura).
        related_entity_id UUID,
        -- 📝 Tipo da entidade relacionada (ex: 'product', 'subscription').
        related_entity_type TEXT,
        -- 📝 Metadados adicionais em JSON (ex: ID do provedor de pagamento).
        metadata JSONB,
        -- 📝 Data e hora de criação da transação.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização da transação.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice no ID do usuário para buscar transações por usuário rapidamente.
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
`;