'''
import { Post } from '../../../types';
import { db } from '../../../database';
import { logService } from '../../logService';
import { ContentDnaService } from '../../ai/core/ContentDnaService';
import { API_BASE } from '../../../apiConfig';
import { MediaFolders } from './mediaConfig';

const API_URL = `${API_BASE}/api/posts`;

export const reelsPostService = {
    async addPost(post: Post): Promise<void> {
        try {
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
        } catch(e) {}

        db.posts.add(post);
        logService.logEvent('PostgreSQL Reels Metadados Adicionados. ✅', { postId: post.id });
    },

    async deletePost(id: string): Promise<void> {
        const post = await db.posts.get(id);
        db.posts.delete(id);

        if (post) {
            logService.logEvent('PostgreSQL Reels Metadados Apagados. 🗑️', { postId: id });
            if (post.media) {
                logService.logEvent('Cloudflare Mídia Apagadas. 🗑️', { postId: id, folder: MediaFolders.REELS });
            }
        }

        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch(e) {}
    }
};
'''