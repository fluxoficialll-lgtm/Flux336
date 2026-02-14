
export const integritySchema = `
    -- 📝 Cria um tipo enumerado para o status da verificação de integridade.
    CREATE TYPE integrity_status AS ENUM ('pending', 'verified', 'failed');

    -- 📝 Tabela para armazenar hashes de arquivos ou dados para verificação de integridade.
    CREATE TABLE IF NOT EXISTS data_integrity (
        -- 📝 ID único para o registro de integridade.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID da entidade cujos dados estão sendo verificados.
        entity_id UUID NOT NULL,
        -- 📝 Tipo da entidade (ex: 'user_profile_picture', 'legal_document').
        entity_type TEXT NOT NULL,
        -- 📝 Algoritmo de hash utilizado (ex: 'SHA-256').
        hash_algorithm TEXT NOT NULL,
        -- 📝 O valor do hash calculado.
        hash_value TEXT NOT NULL,
        -- 📝 Status da última verificação de integridade.
        status integrity_status DEFAULT 'pending',
        -- 📝 Data e hora em que o hash foi criado ou atualizado.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última verificação.
        last_verified_at TIMESTAMPTZ
    );

    -- 📝 Cria um índice combinado em 'entity_type' e 'entity_id' para buscar registros de integridade rapidamente.
    CREATE INDEX IF NOT EXISTS idx_data_integrity_entity ON data_integrity(entity_type, entity_id);
`;
