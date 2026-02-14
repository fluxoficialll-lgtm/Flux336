
export const tagsSchema = `
    -- 📝 Tabela para armazenar todas as tags (hashtags) usadas na plataforma.
    CREATE TABLE IF NOT EXISTS tags (
        -- 📝 ID único da tag.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 O nome da tag (ex: 'javascript', 'fotografia'). Deve ser único.
        name TEXT UNIQUE NOT NULL
    );

    -- 📝 Tabela de associação para ligar tags a diferentes tipos de conteúdo (ex: posts, reels).
    CREATE TABLE IF NOT EXISTS content_tags (
        -- 📝 ID único para a associação.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID da tag.
        tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
        -- 📝 ID do conteúdo que está sendo marcado com a tag.
        content_id UUID NOT NULL,
        -- 📝 Tipo do conteúdo (ex: 'post', 'reel', 'marketplace_product').
        content_type TEXT NOT NULL,
        -- 📝 Garante que um conteúdo não possa ter a mesma tag mais de uma vez.
        UNIQUE(tag_id, content_id, content_type)
    );

    -- 📝 Cria um índice no nome da tag para buscas rápidas e para garantir a unicidade.
    CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
    -- 📝 Cria um índice na tag_id na tabela de associação para encontrar todo o conteúdo com uma tag específica.
    CREATE INDEX IF NOT EXISTS idx_content_tags_tag_id ON content_tags(tag_id);
    -- 📝 Cria um índice combinado para buscar as tags de um conteúdo específico.
    CREATE INDEX IF NOT EXISTS idx_content_tags_content ON content_tags(content_type, content_id);
`;
