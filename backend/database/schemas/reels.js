
export const reelsSchema = `
    CREATE TABLE IF NOT EXISTS reels (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      description TEXT,
      video_url VARCHAR(255) NOT NULL,
      storage_path VARCHAR(255),
      comments_count INT DEFAULT 0 NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reel_likes (
        reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (reel_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_reels_user_id ON reels(user_id);
`;
