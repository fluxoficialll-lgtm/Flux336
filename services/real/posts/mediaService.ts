'''
import { logService } from '../../logService';
import { API_BASE } from '../../../apiConfig';
import { MediaFolder } from './mediaConfig'; // Importando o tipo

const API_URL = `${API_BASE}/api/upload`;

export const mediaService = {
    async uploadMedia(file: File, folder: MediaFolder): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder); // A pasta agora é do tipo MediaFolder

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Falha no upload da mídia: ${res.statusText}`);
            }

            const data = await res.json();
            const mediaUrl = data.url;

            logService.logEvent('Cloudflare Mídia Adicionada. ✅', { url: mediaUrl, folder });

            return mediaUrl;
        } catch (error) {
            logService.logEvent('Cloudflare Falha no Upload de Mídia. ❌', { error });
            throw error;
        }
    }
};
'''