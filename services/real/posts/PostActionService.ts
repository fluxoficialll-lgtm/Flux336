
import { Post } from '../../../types';
import { API_BASE } from '../../../apiConfig';
import { db } from '../../../database';
import { PostUtils } from './PostUtils';
import { ContentDnaService } from '../../ai/core/ContentDnaService';
import { logService } from '../../logService'; // Importando o serviço de log

const API_URL = `${API_BASE}/api/posts`;

export const PostActionService = {
    async uploadMedia(file: File, folder: string = 'feed'): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        const fileUrl = data.files[0].url;
        logService.logEvent('Cloudflare Feed Mídia Adicionadas. ✅', { fileUrl });
        return fileUrl;
    },

    async addPost(post: Post): Promise<void> {
        try {
            // Gera o DNA do conteúdo antes de salvar
            post.dna = await ContentDnaService.generateDna(post);

            const res = await fetch(`${API_URL}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.post) post = data.post;
            }
        } catch (e) {}
        // Salva o post no banco de dados local com o DNA já incluído
        const sanitizedPost = PostUtils.sanitizePost(post);
        db.posts.add(sanitizedPost);

        // Registra o evento de adição de post
        logService.logEvent('PostgreSQL Feed Metadados Adicionados. ✅', { postId: sanitizedPost.id });
    },

    async deletePost(id: string): Promise<void> {
        const post = await db.posts.get(id);
        db.posts.delete(id);

        // Registra o evento de exclusão de post
        logService.logEvent('PostgreSQL Feed Metadados Apagados. 🗑️', { postId: id });
        if (post && post.media) {
            logService.logEvent('Cloudflare Feed Mídia Apagadas. 🗑️', { postId: id });
        }

        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch(e) {}
    }
};
