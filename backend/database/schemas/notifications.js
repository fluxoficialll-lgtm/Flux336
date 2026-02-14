
export const notificationsSchema = `
    -- 📝 Cria um tipo enumerado para o tipo de notificação.
    CREATE TYPE notification_type AS ENUM (
        'like', 
        'comment', 
        'follow', 
        'mention', 
        'group_invite', 
        'message',
        'post_approved'
    );

    -- 📝 Tabela para armazenar as notificações dos usuários.
    CREATE TABLE IF NOT EXISTS notifications (
        -- 📝 ID único da notificação.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que recebe a notificação.
        recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 ID do usuário que originou a notificação (ex: quem deu o like).
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Tipo da notificação, usando o tipo 'notification_type'.
        type notification_type NOT NULL,
        -- 📝 ID do objeto relacionado à notificação (ex: ID do post, ID do comentário).
        object_id UUID,
        -- 📝 Tipo do objeto relacionado (ex: 'post', 'comment').
        object_type TEXT,
        -- 📝 Indica se a notificação já foi lida pelo usuário.
        is_read BOOLEAN DEFAULT FALSE,
        -- 📝 Data e hora de criação da notificação.
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice no ID do destinatário para buscar notificações de um usuário rapidamente.
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
`;
