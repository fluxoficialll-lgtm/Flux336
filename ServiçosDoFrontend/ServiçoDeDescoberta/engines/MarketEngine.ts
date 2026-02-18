
import { MarketplaceItem } from '../../../types';
import { db } from '../../../database';
import { EngineContext } from '../types';

// O MarketEngine é responsável por classificar os itens à venda no marketplace.
// Ele prioriza a localização do usuário, a confiabilidade do vendedor,
// o volume de vendas do item e se o item é um anúncio pago.
export class MarketEngine {
    // Pesos que definem a importância de cada fator no score de um item do marketplace.
    private static WEIGHTS = {
        GEO_PROXIMITY: 8000, // Bônus significativo para itens localizados no mesmo país do usuário.
        TRUST_SCORE: 2000,   // Multiplicador para a pontuação de confiança do vendedor.
        SALES_VOLUME: 500    // Multiplicador para o número de vezes que um item foi vendido.
    };

    /**
     * O método `rank` calcula um "score" para cada item e os ordena.
     * @param items - A lista de itens do marketplace a serem classificados.
     * @param context - O contexto do mecanismo, incluindo o usuário atual.
     * @returns A lista de itens do marketplace ordenada.
     */
    public static rank(items: MarketplaceItem[], context: EngineContext): MarketplaceItem[] {
        const scored = items.map(item => {
            let score = 2000; // Score base inicial.

            // 1. Geolocalização (Ponto crucial do Marketplace)
            // Se o usuário é do Brasil (DDD 55) e o item também, um grande bônus é aplicado.
            if (context.user?.profile?.phone?.startsWith('55') && item.location.includes('Brasil')) {
                score += this.WEIGHTS.GEO_PROXIMITY;
            }

            // 2. Trust Score do Vendedor
            // A pontuação de confiança (Trust Score) do vendedor é adicionada ao score do item.
            const seller = db.users.get(item.sellerId);
            if (seller?.trustScore) {
                score += (seller.trustScore * 2);
            }

            // 3. Prova Social (Volume de Vendas)
            // O número de vezes que o item foi vendido é multiplicado por um peso e adicionado ao score.
            score += (Number(item.soldCount || 0) * this.WEIGHTS.SALES_VOLUME);

            // 4. Anúncios (Ads ganham prioridade máxima no mercado)
            // Se um item é um anúncio, ele recebe um bônus de score muito alto para garantir que apareça no topo.
            if (item.isAd) score += 15000;

            return { item, score };
        });

        // Ordena os itens do maior para o menor score e retorna a lista.
        return scored.sort((a, b) => b.score - a.score).map(s => s.item);
    }
}
