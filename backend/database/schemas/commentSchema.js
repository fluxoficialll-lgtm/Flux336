
/**
 * @fileoverview Schema para a tabela de comentários, utilizando uma associação polimórfica.
 * Isso permite que comentários sejam associados a diferentes tipos de conteúdo (Reels, Posts, Produtos).
 */

/**
 * @typedef {object} Comment
 * @property {number} id - O ID único do comentário (primary key).
 * @property {string} content - O conteúdo textual do comentário.
 * @property {string} author_id - O ID do usuário que postou o comentário (foreign key para a tabela 'users').
 * @property {number} commentable_id - O ID do item pai que está sendo comentado.
 * @property {'post' | 'reel' | 'product'} commentable_type - O tipo do item pai.
 * @property {string} created_at - Timestamp de quando o comentário foi criado.
 * @property {string} updated_at - Timestamp da última atualização do comentário.
 */

export const commentSchema = `
  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commentable_id INTEGER NOT NULL,
    commentable_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Índices para otimizar a busca de comentários por item.
  CREATE INDEX IF NOT EXISTS idx_comments_on_commentable ON comments (commentable_id, commentable_type);
`;

// Gatilho para atualizar o timestamp 'updated_at' em cada atualização.
// A função 'update_updated_at_column' precisa já existir no banco de dados.
export const commentTriggers = `
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
`;
