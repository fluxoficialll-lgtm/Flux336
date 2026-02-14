
export const reelsSchema = `
    -- 📝 Tabela para armazenar os "Reels" ou vídeos curtos.
    CREATE TABLE IF NOT EXISTS reels (
        -- 📝 ID único para o reel.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que criou o reel.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 URL do arquivo de vídeo do reel.
        video_url TEXT NOT NULL,
        -- 📝 URL da imagem de thumbnail (capa) do reel.
        thumbnail_url TEXT,
        -- 📝 Legenda ou descrição do reel.
        caption TEXT,
        -- 📝 Contagem de visualizações do reel.
        view_count INTEGER DEFAULT 0,
        -- 📝 Contagem de likes no reel.
        like_count INTEGER DEFAULT 0,
        -- 📝 Contagem de comentários no reel.
        comment_count INTEGER DEFAULT 0,
        -- 📝 Duração do vídeo em segundos.
        duration_seconds INTEGER,
        -- 📝 Data e hora de publicação do reel.
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice no ID do usuário para buscar todos os reels de um usuário.
    CREATE INDEX IF NOT EXISTS idx_reels_user_id ON reels(user_id);
`;
