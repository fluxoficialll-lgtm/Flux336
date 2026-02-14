
export const usersSchema = `
    -- 📝 Tabela principal para armazenar os dados dos usuários.
    CREATE TABLE IF NOT EXISTS users (
        -- 📝 ID único do usuário.
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        -- 📝 Endereço de e-mail único do usuário. Essencial para comunicação e recuperação.
        email TEXT UNIQUE NOT NULL,
        -- 📝 "Apelido" ou nome de usuário público.
        handle TEXT UNIQUE,
        -- 📝 Hash da senha para autenticação via e-mail.
        password_hash TEXT,
        -- 📝 ID do Google, para login social.
        google_id TEXT UNIQUE,
        -- 📝 Blob JSON para dados de perfil flexíveis (nome, bio, avatar, etc.).
        data JSONB,
        -- 📝 Flag para indicar se o perfil do usuário está completo.
        is_profile_completed BOOLEAN DEFAULT FALSE,
        -- 📝 Data e hora em que a conta do usuário foi criada.
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Tabela para configurações específicas do usuário.
    CREATE TABLE IF NOT EXISTS user_settings (
        -- 📝 ID único da configuração, vinculado ao ID do usuário.
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Configuração de privacidade do perfil (ex: public, private).
        profile_privacy TEXT DEFAULT 'public',
        -- 📝 Preferências de notificação em formato JSON.
        notification_preferences JSONB,
        -- 📝 Preferência de idioma do usuário (ex: 'pt-BR', 'en-US').
        language VARCHAR(10) DEFAULT 'pt-BR',
        -- 📝 Preferência de tema da interface (ex: 'light', 'dark').
        theme TEXT DEFAULT 'light',
        -- 📝 Data e hora da última atualização das configurações.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
`;
