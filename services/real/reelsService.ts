
import { Post } from '../../types';
import { db } from '@/database';
import { recommendationService } from '../recommendationService';
import { chatService } from '../chatService';
import { PostMetricsService } from './PostMetricsService';
import { apiClient } from '../apiClient'; // Usando o apiClient central
import { sqlite } from '../../database/engine';

/**
 * Definição da estrutura dos dados para a criação de um Reel.
 */
interface CreateReelData {
    description: string;
    video: File;
    // Adicionar outros campos que o backend espera, como title, location, etc.
    // Por exemplo: title?: string;
}

export const reelsService = {
  /**
   * Cria um novo Reel enviando os dados para a API do backend.
   * @param reelData - Objeto contendo o arquivo de vídeo e a descrição.
   * @returns A postagem do Reel criada, retornada pelo backend.
   */
  createReel: async (reelData: CreateReelData): Promise<Post> => {
    const formData = new FormData();
    formData.append('video', reelData.video);
    formData.append('description', reelData.description);

    try {
      // apiClient.post já deve estar configurado para lidar com multipart/form-data
      const response = await apiClient.post<Post>('/reels', formData);
      
      // Opcional: Hidratar o cache local com a resposta
      if (response) {
        sqlite.upsertItems('posts', [response]);
      }
      
      return response;
    } catch (error) {
      console.error("Erro ao criar o Reel:", error);
      // Lançar o erro permite que o componente de UI o capture e mostre uma mensagem
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
