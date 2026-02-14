
export const relationshipsSchema = `
    -- 📝 Cria um tipo enumerado para o status de um relacionamento (ex: seguir).
    CREATE TYPE relationship_status AS ENUM ('pending', 'accepted', 'blocked');

    -- 📝 Tabela para armazenar os relacionamentos de "seguir" entre usuários.
    CREATE TABLE IF NOT EXISTS follows (
        -- 📝 ID do usuário que está seguindo.
        follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 ID do usuário que está sendo seguido.
        following_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Status do relacionamento, usando o tipo 'relationship_status'.
        status relationship_status DEFAULT 'accepted',
        -- 📝 Data e hora em que o relacionamento foi criado.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Chave primária composta para garantir que um usuário não siga o mesmo mais de uma vez.
        PRIMARY KEY (follower_id, following_id)
    );

    -- 📝 Cria um índice para otimizar a busca de quem um usuário segue.
    CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
    -- 📝 Cria um índice para otimizar a busca de seguidores de um usuário.
    CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
`;
