
export const chatsSchema = `
    -- 📝 Cria um tipo enumerado para definir os possíveis status de uma mensagem.
    CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

    -- 📝 Tabela para armazenar as conversas (chats) entre usuários ou em grupos.
    CREATE TABLE IF NOT EXISTS chats (
        -- 📝 ID único para a conversa.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 Tipo da conversa. Ex: 'private' (um-para-um), 'group' (em grupo).
        type TEXT NOT NULL DEFAULT 'private',
        -- 📝 Array com os IDs dos usuários participantes da conversa.
        participant_ids UUID[],
        -- 📝 Data e hora de criação da conversa.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última mensagem enviada na conversa, para ordenação.
        last_message_at TIMESTAMPTZ
    );

    -- 📝 Tabela para armazenar as mensagens de cada conversa.
    CREATE TABLE IF NOT EXISTS messages (
        -- 📝 ID único para a mensagem.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID da conversa à qual a mensagem pertence.
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
        -- 📝 ID do usuário que enviou a mensagem.
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Conteúdo textual da mensagem.
        content TEXT NOT NULL,
        -- 📝 Status atual da mensagem, usando o tipo enumerado 'message_status'.
        status message_status DEFAULT 'sent',
        -- 📝 Data e hora em que a mensagem foi enviada.
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice na coluna 'participant_ids' usando o operador GIN, otimizado para buscas em arrays.
    CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats USING GIN(participant_ids);
    -- 📝 Cria um índice na coluna 'chat_id' da tabela 'messages' para buscar mensagens de um chat rapidamente.
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
`;
