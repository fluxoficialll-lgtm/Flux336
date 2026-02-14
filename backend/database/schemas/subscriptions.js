
export const subscriptionsSchema = `
    -- 📝 Cria um tipo enumerado para o status de uma assinatura.
    CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');

    -- 📝 Tabela para gerenciar as assinaturas de usuários (ex: acesso VIP).
    CREATE TABLE IF NOT EXISTS subscriptions (
        -- 📝 ID único da assinatura.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário assinante.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 ID do plano de assinatura (poderia ser uma FK para uma tabela de planos).
        plan_id TEXT NOT NULL,
        -- 📝 Status atual da assinatura, usando o tipo 'subscription_status'.
        status subscription_status NOT NULL,
        -- 📝 Data de início do período de faturamento atual.
        current_period_start TIMESTAMPTZ,
        -- 📝 Data de fim do período de faturamento atual.
        current_period_end TIMESTAMPTZ,
        -- 📝 Data em que a assinatura foi cancelada.
        cancelled_at TIMESTAMPTZ,
        -- 📝 Data e hora de criação do registro da assinatura.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização da assinatura.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice no ID do usuário para buscar as assinaturas de um usuário.
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
`;
