
export const feesSchema = `
    -- 📝 Tabela para definir e gerenciar as taxas da plataforma (ex: taxa de transação, taxa de serviço).
    CREATE TABLE IF NOT EXISTS fees (
        -- 📝 ID único para o registro de taxa.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 Nome ou tipo da taxa para identificação.
        name TEXT UNIQUE NOT NULL,
        -- 📝 Descrição do que a taxa representa.
        description TEXT,
        -- 📝 Tipo de cálculo da taxa: 'percentage' (percentual) ou 'fixed' (valor fixo).
        type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
        -- 📝 O valor da taxa. Se for percentual, armazena a porcentagem (ex: 2.5 para 2.5%). Se for fixo, o valor monetário.
        value NUMERIC(10, 4) NOT NULL,
        -- 📝 Data e hora de criação do registro da taxa.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização do registro da taxa.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Insere as taxas padrão na plataforma se ainda não existirem.
    
    -- 📝 Taxa de plataforma sobre vendas VIP.
    INSERT INTO fees (name, description, type, value) 
    VALUES ('vip_platform_fee', 'Taxa da plataforma sobre vendas de acesso VIP', 'percentage', 20.00)
    ON CONFLICT (name) DO NOTHING;

    -- 📝 Taxa de processamento de pagamento para saques (withdrawals).
    INSERT INTO fees (name, description, type, value) 
    VALUES ('withdrawal_processing_fee', 'Taxa de processamento para saques da carteira', 'fixed', 3.00)
    ON CONFLICT (name) DO NOTHING;
`;
