
export const auditSchema = `
    -- 📝 Tabela para registros de auditoria. Captura ações importantes realizadas no sistema para segurança e conformidade.
    CREATE TABLE IF NOT EXISTS audit_log (
        -- 📝 ID único autoincrementável para cada registro de log.
        id SERIAL PRIMARY KEY,
        -- 📝 ID do usuário que realizou a ação (se aplicável). Pode ser nulo se a ação for do sistema.
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 Tipo da ação realizada. Ex: 'user_login', 'post_deleted', 'group_created'.
        action_type TEXT NOT NULL,
        -- 📝 ID da entidade que foi afetada pela ação. Ex: o ID do post que foi deletado.
        target_id TEXT,
        -- 📝 Tipo da entidade afetada. Ex: 'post', 'user', 'comment'.
        target_type TEXT,
        -- 📝 Detalhes da ação em formato JSON. Armazena o "antes" e o "depois" para rastrear mudanças.
        details JSONB,
        -- 📝 Endereço IP de origem da requisição que disparou a ação.
        ip_address TEXT,
        -- 📝 Agente do usuário (informações do navegador/cliente) que fez a requisição.
        user_agent TEXT,
        -- 📝 Data e hora em que a ação ocorreu.
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice na coluna 'user_id' para otimizar a busca de logs por usuário.
    CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
    -- 📝 Cria um índice nas colunas 'target_type' e 'target_id' para otimizar a busca de logs por entidade específica.
    CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_type, target_id);

`;