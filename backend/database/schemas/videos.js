
export const videosSchema = `
    -- 📝 Tabela para vídeos mais longos, diferenciando-se dos "Reels".
    CREATE TABLE IF NOT EXISTS videos (
        -- 📝 ID único do vídeo.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que fez o upload do vídeo.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 URL do arquivo de vídeo.
        video_url TEXT NOT NULL,
        -- 📝 URL da imagem de thumbnail (capa) do vídeo.
        thumbnail_url TEXT,
        -- 📝 Título do vídeo.
        title TEXT NOT NULL,
        -- 📝 Descrição detalhada do vídeo.
        description TEXT,
        -- 📝 Duração do vídeo em segundos.
        duration_seconds INTEGER,
        -- 📝 Contagem de visualizações do vídeo.
        view_count INTEGER DEFAULT 0,
        -- 📝 Contagem de likes no vídeo.
        like_count INTEGER DEFAULT 0,
        -- 📝 Data e hora de publicação do vídeo.
        published_at TIMESTAMPTZ,
        -- 📝 Data e hora de criação do registro do vídeo.
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice no ID do usuário para buscar todos os vídeos de um usuário.
    CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
`;
