'''
import { Post } from '../../types';
import { mediaService } from './posts/mediaService';
import { feedPostService } from './posts/feedPostService';
import { groupPostService } from './posts/groupPostService';
import { reelsPostService } from './posts/reelsPostService';
import { marketplaceService } from './posts/marketplaceService';
import { MediaFolder, MediaFolders } from './posts/mediaConfig'; // Importando MediaFolder e MediaFolders

// Definindo os canais com base nas chaves do MediaFolders (exceto PROFILES)
type PostChannel = Exclude<keyof typeof MediaFolders, 'PROFILES'>;

export const PostActionService = {
    // O parâmetro channel agora é mais forte e derivado da configuração
    async addPost(channel: PostChannel, post: Post): Promise<void> {
        switch (channel) {
            case 'FEED':
                return feedPostService.addPost(post);
            case 'GROUPS':
                return groupPostService.addPost(post);
            case 'REELS':
                return reelsPostService.addPost(post);
            case 'MARKETPLACE':
                return marketplaceService.addProduct(post);
            default:
                // Esta linha agora é praticamente inalcançável devido ao TypeScript
                throw new Error(`Canal de postagem desconhecido: ${channel}`);
        }
    },

    async deletePost(channel: PostChannel, id: string): Promise<void> {
        switch (channel) {
            case 'FEED':
                return feedPostService.deletePost(id);
            case 'GROUPS':
                return groupPostService.deletePost(id);
            case 'REELS':
                return reelsPostService.deletePost(id);
            case 'MARKETPLACE':
                return marketplaceService.deleteProduct(id);
            default:
                throw new Error(`Canal de postagem desconhecido: ${channel}`);
        }
    },

    // O parâmetro folder agora usa o tipo MediaFolder
    async uploadMedia(file: File, folder: MediaFolder = MediaFolders.FEED): Promise<string> {
        return mediaService.uploadMedia(file, folder);
    }
};
'''