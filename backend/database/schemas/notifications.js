
export const notificationsSchema = `
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY, 
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        type VARCHAR(50) NOT NULL, 
        data JSONB, 
        is_read BOOLEAN DEFAULT FALSE, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
`;
