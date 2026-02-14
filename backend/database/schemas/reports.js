
export const reportsSchema = `
    -- 📝 Cria um tipo enumerado para a categoria da denúncia.
    CREATE TYPE report_category AS ENUM ('spam', 'harassment', 'hate_speech', 'impersonation', 'inappropriate_content', 'other');
    -- 📝 Cria um tipo enumerado para o status de uma denúncia.
    CREATE TYPE report_status AS ENUM ('pending', 'in_review', 'resolved', 'dismissed');

    -- 📝 Tabela para que usuários possam denunciar conteúdos ou outros usuários.
    CREATE TABLE IF NOT EXISTS reports (
        -- 📝 ID único da denúncia.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que fez a denúncia.
        reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 ID do item ou usuário que está sendo denunciado.
        target_id UUID NOT NULL,
        -- 📝 Tipo do item ou usuário denunciado (ex: 'post', 'user', 'comment').
        target_type TEXT NOT NULL,
        -- 📝 Categoria da denúncia, usando o tipo 'report_category'.
        category report_category NOT NULL,
        -- 📝 Detalhes ou justificativa da denúncia.
        reason TEXT,
        -- 📝 Status atual da denúncia, usando o tipo 'report_status'.
        status report_status DEFAULT 'pending',
        -- 📝 ID do moderador ou administrador que está tratando a denúncia.
        moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 Data e hora da criação da denúncia.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização da denúncia.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice combinado em 'target_type' e 'target_id' para buscar denúncias sobre um item específico.
    CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
    -- 📝 Cria um índice no status para buscar denúncias pendentes ou em revisão.
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
`;
