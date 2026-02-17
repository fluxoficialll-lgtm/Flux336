
import { Relationship, User } from '../../types';
import { authService } from '../authService';
import { db } from '@/database';
import { apiClient } from '../apiClient';

export const relationshipService = {
  /**
   * Sincroniza os relacionamentos do usuário logado com o servidor.
   */
  syncRelationships: async () => {
    const currentId = authService.getCurrentUserId();
    if (!currentId) return;

    try {
        const data = await apiClient.get(`/relationships/me?followerId=${encodeURIComponent(currentId)}`);
        if (data && data.relationships && Array.isArray(data.relationships)) {
            data.relationships.forEach((rel: Relationship) => {
                db.relationships.add(rel);
            });
        }
    } catch (e) {
        console.warn("⚠️ [Relationship] Falha ao sincronizar relacionamentos.");
    }
  },

  followUser: async (targetHandle: string): Promise<'following' | 'requested'> => {
    const currentId = authService.getCurrentUserId();
    if (!currentId) throw new Error("Você precisa estar logado.");
    if (!targetHandle) throw new Error("Usuário inválido.");

    const cleanHandle = String(targetHandle).replace('@', '').toLowerCase().trim();
    
    // Tenta encontrar o usuário alvo
    let targetUser = authService.getUserByHandle(cleanHandle);
    if (!targetUser) {
        targetUser = await authService.fetchUserByHandle(cleanHandle);
    }

    if (!targetUser) throw new Error("Usuário não encontrado no sistema.");

    try {
        await apiClient.post(`/relationships/follow`, { 
            followerId: currentId, 
            followingId: targetUser.id,
            status: 'accepted'
        });

        const rel: Relationship = { 
            followerId: currentId, 
            followingId: targetUser.id, 
            followingUsername: `@${cleanHandle}`, 
            status: 'accepted' 
        };
        
        db.relationships.add(rel);
        return 'following';
    } catch (e: any) {
        console.error("[RelationshipService] Follow error:", e);
        throw e;
    }
  },

  unfollowUser: async (targetHandle: string) => {
    const currentId = authService.getCurrentUserId();
    if (!currentId || !targetHandle) return;

    const cleanHandle = String(targetHandle).replace('@', '').toLowerCase().trim();
    
    let targetUser = authService.getUserByHandle(cleanHandle);
    if (!targetUser) {
        targetUser = await authService.fetchUserByHandle(cleanHandle);
    }
    
    if (!targetUser) return;
    
    try {
        await apiClient.post(`/relationships/unfollow`, { followerId: currentId, followingId: targetUser.id });
        db.relationships.remove(currentId, targetUser.id);
    } catch (e) {
        console.error("[RelationshipService] Unfollow error:", e);
        throw e;
    }
  },

  isFollowing: (targetHandleOrId: string): 'none' | 'following' | 'requested' => {
    if (!targetHandleOrId) return 'none';
    
    const currentId = authService.getCurrentUserId();
    if (!currentId) return 'none';

    const term = String(targetHandleOrId).replace('@', '').toLowerCase().trim();
    const allRels = db.relationships.getAll();
    
    const rel = allRels.find(r => 
        r && String(r.followerId) === String(currentId) && 
        (
            String(r.followingId) === String(targetHandleOrId) ||
            (r.followingUsername && String(r.followingUsername).toLowerCase().replace('@', '') === term)
        )
    );
    
    if (rel) return rel.status === 'accepted' ? 'following' : 'requested';
    return 'none';
  },

  getFollowers: (handle: string) => {
    if (!handle) return [];
    const cleanHandle = String(handle).replace('@', '').toLowerCase();
    const targetUser = authService.getUserByHandle(cleanHandle);
    if (!targetUser) return [];
    
    const rels = db.relationships.getAll().filter(r => 
        r && String(r.followingId) === String(targetUser.id) && 
        r.status === 'accepted'
    );
    
    const allUsers = db.users.getAll();
    return rels.map(r => {
        const u = Object.values(allUsers).find(user => user.id === r.followerId);
        return { 
            name: u?.profile?.nickname || u?.profile?.name || 'User', 
            username: u?.profile?.name || 'user', 
            avatar: u?.profile?.photoUrl 
        };
    });
  },

  getFollowing: (userId: string) => {
    if (!userId) return [];
    const rels = db.relationships.getAll().filter(r => 
        r && String(r.followerId) === String(userId) && 
        r.status === 'accepted'
    );
    
    const allUsers = db.users.getAll();
    return rels.map(r => {
        const u = Object.values(allUsers).find(user => user.id === r.followingId);
        return { 
            name: u?.profile?.nickname || u?.profile?.name || 'User', 
            username: u?.profile?.name || 'user', 
            avatar: u?.profile?.photoUrl 
        };
    });
  },

  getMutualFriends: async () => {
      const userId = authService.getCurrentUserId();
      if (!userId) return [];
      
      const allRels = db.relationships.getAll();
      const followingIds = allRels
          .filter(r => r && String(r.followerId) === String(userId) && r.status === 'accepted')
          .map(r => r.followingId);
          
      const followerIds = allRels
          .filter(r => r && String(r.followingId) === String(userId) && r.status === 'accepted')
          .map(r => r.followerId);
          
      const mutualIds = followingIds.filter(id => followerIds.includes(id));
      
      const allUsers = db.users.getAll();
      return mutualIds.map(id => {
          const u = Object.values(allUsers).find(user => user.id === id);
          return { 
              id, 
              name: u?.profile?.nickname || u?.profile?.name || '', 
              username: u?.profile?.name || '', 
              avatar: u?.profile?.photoUrl || '' 
          };
      });
  },

  getTopCreators: async () => {
      try {
          const data = await apiClient.get(`/rankings/top`);
          return data.data || [];
      } catch (e) {
          return [];
      }
  },

  acceptFollowRequest: async (targetHandle: string) => {
      const currentId = authService.getCurrentUserId();
      if (!targetHandle) return;
      const cleanHandle = String(targetHandle).replace('@', '').toLowerCase();
      const targetUser = authService.getUserByHandle(cleanHandle);
      if (!currentId || !targetUser) return;
      
      const rel = db.relationships.getAll().find(r => 
          r && String(r.followerId) === String(targetUser.id) && 
          String(r.followingId) === String(currentId)
      );
      
      if (rel) {
          rel.status = 'accepted';
          db.relationships.add(rel);
      }
  },

  rejectFollowRequest: async (targetHandle: string) => {
      const currentId = authService.getCurrentUserId();
      if (!targetHandle) return;
      const cleanHandle = String(targetHandle).replace('@', '').toLowerCase();
      const targetUser = authService.getUserByHandle(cleanHandle);
      if (!currentId || !targetUser) return;
      db.relationships.remove(targetUser.id, currentId);
  }
};