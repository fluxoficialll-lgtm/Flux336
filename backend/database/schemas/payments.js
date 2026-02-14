
export const paymentsSchema = `
    -- 📝 Cria um tipo enumerado para os status de um pagamento.
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

    -- 📝 Tabela para registrar pagamentos realizados na plataforma.
    CREATE TABLE IF NOT EXISTS payments (
        -- 📝 ID único do pagamento.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que efetuou o pagamento (pagador).
        payer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 ID do usuário que recebeu o pagamento (recebedor).
        payee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 ID da ordem ou produto associado ao pagamento.
        order_id UUID,
        -- 📝 Valor do pagamento.
        amount NUMERIC(15, 2) NOT NULL,
        -- 📝 Moeda do pagamento.
        currency VARCHAR(3) NOT NULL,
        -- 📝 Status atual do pagamento, usando o tipo 'payment_status'.
        status payment_status DEFAULT 'pending',
        -- 📝 ID da transação no provedor de pagamento externo (ex: Stripe, PayPal).
        provider_transaction_id TEXT,
        -- 📝 Nome do provedor de pagamento.
        payment_provider TEXT,
        -- 📝 Data e hora de criação do registro de pagamento.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização do status do pagamento.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice no ID do pagador para buscar seus pagamentos.
    CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
    -- 📝 Cria um índice no ID do recebedor para buscar os pagamentos que ele recebeu.
    CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON payments(payee_id);
`;
