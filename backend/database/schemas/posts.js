
export const postsSchema = `
    -- 📝 Cria um tipo enumerado para o status de um post.
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived', 'deleted');

    -- 📝 Tabela principal para armazenar os posts dos usuários.
    CREATE TABLE IF NOT EXISTS posts (
        -- 📝 ID único do post.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que criou o post.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Conteúdo de texto do post.
        content TEXT,
        -- 📝 Array de URLs de mídia (imagens, vídeos) associadas ao post.
        media_urls TEXT[],
        -- 📝 Status do post, usando o tipo 'post_status'.
        status post_status DEFAULT 'draft',
        -- 📝 Contagem de likes no post.
        like_count INTEGER DEFAULT 0,
        -- 📝 Contagem de comentários no post.
        comment_count INTEGER DEFAULT 0,
        -- 📝 Data e hora de criação do post.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização do post.
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data em que o post foi (ou será) publicado.
        published_at TIMESTAMPTZ
    );

    -- 📝 Cria um índice no ID do usuário para buscar os posts de um usuário rapidamente.
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    -- 📝 Cria um índice na data de publicação para ordenar o feed de forma eficiente.
    CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
`;
