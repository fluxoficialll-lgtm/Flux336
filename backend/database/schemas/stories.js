
export const storiesSchema = `
    -- 📝 Tabela para armazenar os "Stories" dos usuários, que são temporários.
    CREATE TABLE IF NOT EXISTS stories (
        -- 📝 ID único do story.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que criou o story.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 URL da mídia do story (imagem ou vídeo).
        media_url TEXT NOT NULL,
        -- 📝 Tipo de mídia ('image' ou 'video').
        media_type TEXT NOT NULL DEFAULT 'image',
        -- 📝 Data e hora de criação do story.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora em que o story deve expirar (normalmente 24 horas após a criação).
        expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
    );

    -- 📝 Tabela para registrar quem visualizou cada story.
    CREATE TABLE IF NOT EXISTS story_views (
        -- 📝 ID único do registro de visualização.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do story que foi visualizado.
        story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
        -- 📝 ID do usuário que visualizou o story.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Data e hora da visualização.
        viewed_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Garante que cada usuário só tenha uma visualização registrada por story.
        UNIQUE(story_id, user_id)
    );

    -- 📝 Cria um índice no ID do usuário para buscar os stories de um usuário.
    CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
    -- 📝 Cria um índice na data de expiração para facilitar a limpeza de stories antigos.
    CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
    -- 📝 Cria um índice no ID do story na tabela de visualizações para buscar quem viu.
    CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
`;
