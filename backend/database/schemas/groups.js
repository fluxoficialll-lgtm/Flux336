
export const groupsSchema = `
    -- 📝 Cria um tipo enumerado para definir a privacidade de um grupo.
    CREATE TYPE group_privacy AS ENUM ('public', 'private', 'secret');

    -- 📝 Tabela para armazenar informações sobre os grupos.
    CREATE TABLE IF NOT EXISTS groups (
        -- 📝 ID único para o grupo.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que criou o grupo (proprietário).
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 Nome do grupo.
        name TEXT NOT NULL,
        -- 📝 Descrição do grupo.
        description TEXT,
        -- 📝 URL da imagem de capa do grupo.
        cover_image_url TEXT,
        -- 📝 Nível de privacidade do grupo, usando o tipo 'group_privacy'.
        privacy group_privacy NOT NULL DEFAULT 'public',
        -- 📝 Data e hora de criação do grupo.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização dos dados do grupo.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Tabela de associação para registrar os membros de cada grupo.
    CREATE TABLE IF NOT EXISTS group_members (
        -- 📝 ID único para a associação.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do grupo.
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        -- 📝 ID do usuário que é membro.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Papel do membro no grupo (ex: 'admin', 'moderator', 'member').
        role TEXT NOT NULL DEFAULT 'member',
        -- 📝 Data e hora em que o usuário se tornou membro.
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Garante que um usuário só pode se juntar a um grupo uma única vez.
        UNIQUE(group_id, user_id)
    );

    -- 📝 Cria um índice na coluna 'owner_id' da tabela 'groups' para buscar grupos por proprietário.
    CREATE INDEX IF NOT EXISTS idx_groups_owner_id ON groups(owner_id);
    -- 📝 Cria um índice na coluna 'group_id' da tabela 'group_members' para buscar membros de um grupo.
    CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
    -- 📝 Cria um índice na coluna 'user_id' da tabela 'group_members' para buscar os grupos de um usuário.
    CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
`;
