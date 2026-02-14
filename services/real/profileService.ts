import { UserProfile, User } from '../../types';
import { db } from '@/database';
import { sqlite } from '@/database/engine';
import { API_BASE } from '../../apiConfig';
import { userSearchService } from './userSearchService';
import { apiClient } from '../apiClient';

const API_USERS = `${API_BASE}/api/users`;

export const profileService = {
  
  syncAllUsers: async (): Promise<void> => {
    try {
      const users = await apiClient.get<User[]>(`/users`);
      if (users && users.length > 0) {
        sqlite.upsertItems('users', users);
      }
    } catch (error) {
      console.error("Falha ao sincronizar todos os usuários:", error);
    }
  },

  getUserProfile: async (userId: string): Promise<User | null> => {
    const localUser = db.users.findById(userId);
    if (localUser) {
      return localUser;
    }

    try {
      const user = await apiClient.get<User>(`/profile/${userId}`);
      if (user) {
        sqlite.upsertItems('users', [user]);
        return user;
      }
      return null;
    } catch (error) {
      console.error(`Falha ao buscar o perfil do usuário ${userId}:`, error);
      return null;
    }
  },

  completeProfile: async (email: string, data: UserProfile): Promise<User> => {
      const response = await fetch(`${API_USERS}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim(), updates: { profile: data, isProfileCompleted: true } })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao atualizar perfil.");
      
      sqlite.upsertItems('users', [result.user]);
      localStorage.setItem('cached_user_profile', JSON.stringify(result.user));
      return result.user;
  },

  checkUsernameAvailability: async (name: string): Promise<boolean> => {
      const results = await userSearchService.searchUsers(name);
      return !results.some(u => u.profile?.name === name.toLowerCase());
  }
};
