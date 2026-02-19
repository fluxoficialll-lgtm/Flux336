
import { NextApiRequest, NextApiResponse } from 'next';
import { Post, MarketplaceItem } from '@/types';
import { postService } from '@/ServiçosDoFrontend/real/postService';
import { marketplaceService } from '@/ServiçosDoFrontend/real/marketplaceService';
import { RecommendationService } from '@/ServiçosDoFrontend/ai/core/RecommendationService';

/**
 * API Endpoint: /api/recommendations
 * 
 * Retorna recomendações de conteúdo com base em um item de referência.
 * 
 * Query Params:
 *  - refId: O ID do post ou item de marketplace de referência.
 *  - refType: O tipo do item de referência ('post' or 'marketplace').
 *  - limit: (Opcional) O número máximo de recomendações a serem retornadas.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { refId, refType, limit = '10' } = req.query;

    if (!refId || typeof refId !== 'string' || !refType || (refType !== 'post' && refType !== 'marketplace')) {
        return res.status(400).json({ message: 'ID de referência (refId) e tipo (refType) são obrigatórios.' });
    }

    try {
        // 1. Encontrar o DNA do item de referência
        let referenceItem;
        if (refType === 'post') {
            referenceItem = await postService.getPostById(refId);
        } else {
            referenceItem = marketplaceService.getItemById(refId);
        }

        if (!referenceItem || !referenceItem.dna) {
            return res.status(404).json({ message: 'Item de referência não encontrado ou não possui DNA.' });
        }

        // 2. Buscar todos os outros itens (candidatos para recomendação)
        const allPosts = await postService.getFeedPaginated(1, 100); // Simplificação: pega os últimos 100 posts
        const allMarketplaceItems = marketplaceService.getItems();
        const allItems = [...allPosts.posts, ...allMarketplaceItems].filter(item => item.id !== refId);

        // 3. Usar o serviço de recomendação para obter a lista final
        const recommendations = RecommendationService.getRecommendations(
            referenceItem.dna,
            allItems
        );

        // 4. Limitar o número de resultados e retornar
        const finalResults = recommendations.slice(0, parseInt(limit as string, 10));

        res.status(200).json({ data: finalResults });

    } catch (error) {
        console.error('Erro ao gerar recomendações:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}
