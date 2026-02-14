
export const infrastructureSchema = `
    -- 📝 Tabela para armazenar o status e a saúde de diferentes serviços da infraestrutura.
    CREATE TABLE IF NOT EXISTS service_status (
        -- 📝 ID único para o registro de status do serviço.
        id SERIAL PRIMARY KEY,
        -- 📝 Nome do serviço monitorado (ex: 'database', 'api', 'storage').
        service_name TEXT UNIQUE NOT NULL,
        -- 📝 Status atual do serviço (ex: 'operational', 'degraded', 'outage').
        status TEXT NOT NULL,
        -- 📝 Detalhes adicionais sobre o status em formato JSON.
        details JSONB,
        -- 📝 Data e hora da última verificação ou atualização do status.
        last_checked_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Tabela para logs específicos da infraestrutura, diferente da auditoria de ações do usuário.
    CREATE TABLE IF NOT EXISTS infrastructure_logs (
        -- 📝 ID único autoincrementável para o log.
        id BIGSERIAL PRIMARY KEY,
        -- 📝 Nível do log (ex: 'INFO', 'WARNING', 'ERROR', 'FATAL').
        log_level TEXT NOT NULL,
        -- 📝 Mensagem do log.
        message TEXT NOT NULL,
        -- 📝 Origem do log (ex: nome do serviço, nome do pod).
        source TEXT,
        -- 📝 Dados estruturados adicionais em formato JSON.
        metadata JSONB,
        -- 📝 Data e hora em que o log foi gerado.
        timestamp TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice na coluna 'service_name' para buscas rápidas de status.
    CREATE INDEX IF NOT EXISTS idx_service_status_name ON service_status(service_name);
    -- 📝 Cria um índice na coluna 'log_level' para filtrar logs por nível de severidade.
    CREATE INDEX IF NOT EXISTS idx_infrastructure_logs_level ON infrastructure_logs(log_level);
    -- 📝 Cria um índice na coluna 'source' para filtrar logs pela sua origem.
    CREATE INDEX IF NOT EXISTS idx_infrastructure_logs_source ON infrastructure_logs(source);
`;
