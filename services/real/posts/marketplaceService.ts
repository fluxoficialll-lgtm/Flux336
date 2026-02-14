'''
import { Post } from '../../../types';
import { db } from '../../../database';
import { logService } from '../../logService';
import { API_BASE } from '../../../apiConfig';
import { MediaFolders } from './mediaConfig';

const API_URL = `${API_BASE}/api/posts`;

export const marketplaceService = {
    async addProduct(product: Post): Promise<void> {
        try {
            const res = await fetch(`${API_URL}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.post) product = data.post;
            }
        } catch(e) {}

        db.posts.add(product);
        logService.logEvent('PostgreSQL Marketplace Metadados Adicionados. ✅', { productId: product.id });
    },

    async deleteProduct(id: string): Promise<void> {
        const product = await db.posts.get(id);
        db.posts.delete(id);

        if (product) {
            logService.logEvent('PostgreSQL Marketplace Metadados Apagados. 🗑️', { productId: id });
            if (product.media) {
                logService.logEvent('Cloudflare Mídia Apagadas. 🗑️', { productId: id, folder: MediaFolders.MARKETPLACE });
            }
        }

        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch(e) {}
    }
};
'''