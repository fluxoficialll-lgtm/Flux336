
import { query } from '../pool.js';

// Mapeia uma linha do banco de dados para um objeto de relacionamento mais limpo.
const mapRowToRelationship = (row) => {
    if (!row) return null;
    return {
        followerId: row.follower_id,
        followingId: row.following_id,
        status: row.status,
        createdAt: row.created_at
    };
};

export const RelationshipRepository = {
    // Cria ou atualiza um relacionamento (seguir).
    async upsert({ followerId, followingId, status = 'accepted' }) {
        await query(`
            INSERT INTO follows (follower_id, following_id, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (follower_id, following_id) DO UPDATE SET status = $3
        `, [followerId, followingId, status]);
    },

    // Deleta um relacionamento (deixar de seguir).
    async delete(followerId, followingId) {
        await query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [followerId, followingId]);
    },

    // Encontra todos os usuários que um determinado usuário segue.
    async findFollowing(followerId) {
        const res = await query('SELECT * FROM follows WHERE follower_id = $1 AND status = \'accepted\'', [followerId]);
        return res.rows.map(mapRowToRelationship);
    },
    
    // Encontra todos os seguidores de um determinado usuário.
    async findFollowers(followingId) {
        const res = await query('SELECT * FROM follows WHERE following_id = $1 AND status = \'accepted\'', [followingId]);
        return res.rows.map(mapRowToRelationship);
    },

    // Obtém a contagem de seguidores para os principais criadores.
    async getTopCreators() {
        const res = await query(`
            SELECT u.id, u.handle, u.data->>'avatar' as avatar, COUNT(f.follower_id) as followers_count
            FROM follows f
            JOIN users u ON f.following_id = u.id
            WHERE f.status = 'accepted'
            GROUP BY u.id, u.handle, u.data->>'avatar'
            ORDER BY followers_count DESC
            LIMIT 50
        `);
        return res.rows.map(row => ({
            id: row.id,
            handle: row.handle,
            avatar: row.avatar,
            followersCount: parseInt(row.followers_count, 10)
        }));
    }
};
