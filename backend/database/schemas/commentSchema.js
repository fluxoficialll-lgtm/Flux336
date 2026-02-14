
export const commentSchema = `
    -- 📝 Tabela para armazenar comentários em diferentes tipos de conteúdo (posts, reels, etc.).
    CREATE TABLE IF NOT EXISTS comments (
        -- 📝 ID único para o comentário.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que fez o comentário.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 ID do conteúdo que está sendo comentado.
        parent_id UUID NOT NULL,
        -- 📝 Tipo do conteúdo que está sendo comentado (ex: 'post', 'reel').
        parent_type TEXT NOT NULL, 
        -- 📝 ID do comentário pai (se for uma resposta a outro comentário).
        reply_to_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        -- 📝 O texto do comentário.
        content TEXT NOT NULL,
        -- 📝 Contagem de "likes" ou reações positivas no comentário.
        like_count INTEGER DEFAULT 0,
        -- 📝 Data e hora de criação do comentário.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última edição do comentário.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice combinado em 'parent_type' e 'parent_id' para buscar todos os comentários de um item específico rapidamente.
    CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_type, parent_id);
`;
