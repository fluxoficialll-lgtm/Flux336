
import { Post } from '../../types';
import { db } from '@/database';
import { recommendationService } from '../recommendationService';
import { chatService } from '../chatService';
import { PostMetricsService } from './PostMetricsService';
import { apiClient } from '../apiClient';
import { sqlite } from '../../database/engine';
import { logService } from '../logService'; // Importando o serviço de log

interface CreateReelData {
    description: string;
    video: File;
}

export const reelsService = {
  createReel: async (reelData: CreateReelData): Promise<Post> => {
    const formData = new FormData();
    formData.append('video', reelData.video);
    formData.append('description', reelData.description);

    try {
      const response = await apiClient.post<Post>('/reels', formData);
      
      if (response) {
        sqlite.upsertItems('posts', [response]);
        // Log da criação do Reel
        logService.logEvent('PostgreSQL Reels Metadados Adicionados. ✅', { reelId: response.id });
      }
      
      return response;
    } catch (error) {
      console.error("Erro ao criar o Reel:", error);
      throw new Error('Falha ao publicar o Reel. Tente novamente.');
    }
  },

  fetchReels: async (): Promise<void> => {
    try {
        const response = await apiClient.get<{ data: Post[] }>('/posts?limit=50&type=video');
        if (response && response.data) {
            const videos = response.data.filter((p: any) => p.type === 'video');
            
            if (videos.length > 0) {
                sqlite.upsertItems('posts', videos);
            }
        }
    } catch (e) {
        console.warn("Reels fetch failed, using local cache");
    }
  },

  getReels: (userEmail?: string, allowAdultContent: boolean = false): Post[] => {
    const allPosts = db.posts.getAll();
    let videos = allPosts.filter(p => p && p.type === 'video');

    if (!allowAdultContent) {
        videos = videos.filter(p => !p.isAdultContent);
    }

    if (userEmail) {
        const blockedIds = chatService.getBlockedIdentifiers(String(userEmail));
        if (blockedIds.size > 0) {
            videos = videos.filter(p => {
                const username = String(p.username || "");
                const handle = username.replace('@', '').toLowerCase();
                return !blockedIds.has(username) && !blockedIds.has(handle);
            });
        }
    }

    return videos.sort((a, b) => b.timestamp - a.timestamp);
  },

  getReelsByAuthor: (authorId: string, allowAdultContent: boolean = false): Post[] => {
    const allPosts = db.posts.getAll();
    let videos = allPosts.filter(p => p && p.type === 'video' && p.authorId === authorId);
    if (!allowAdultContent) {
        videos = videos.filter(p => !p.isAdultContent);
    }
    return videos.sort((a, b) => b.timestamp - a.timestamp);
  },

  searchReels: (query: string, category: string, userEmail?: string): Post[] => {
      const allPosts = db.posts.getAll();
      let videos = allPosts.filter(p => p && p.type === 'video');
      const term = String(query || "").toLowerCase().trim();

      return videos.filter(reel => {
          if (term) {
              return String(reel.text || "").toLowerCase().includes(term) || 
                     String(reel.username || "").toLowerCase().includes(term);
          }
          return true;
      });
  },

  toggleLike: async (reelId: string): Promise<Post | undefined> => {
    return await PostMetricsService.toggleLike(reelId, false);
  },

  incrementView: (reelId: string) => {
    PostMetricsService.trackView(reelId);
    recommendationService.trackImpression(reelId);
  }
};
