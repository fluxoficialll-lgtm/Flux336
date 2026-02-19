
import { Post, MarketplaceItem, ContentDNA } from "@/types";

// Tipos de conteúdo que o serviço pode processar
type RecommendableItem = Post | MarketplaceItem;

/**
 * RecommendationService
 * 
 * Motor de recomendação baseado no DNA do conteúdo.
 * Utiliza uma abordagem de similaridade para encontrar itens relevantes.
 */
export const RecommendationService = {

    /**
     * Calcula uma pontuação de similaridade entre dois DNAs.
     * A pontuação é maior quanto mais próximos os DNAs forem.
     * 
     * @param dna1 - O primeiro DNA para comparação.
     * @param dna2 - O segundo DNA para comparação.
     * @returns Um número representando a pontuação de similaridade (0 a 1).
     */
    calculateSimilarity(dna1: ContentDNA, dna2: ContentDNA): number {
        if (!dna1 || !dna2) return 0;

        let score = 0;

        // Comparação de Categoria Primária (maior peso)
        if (dna1.primaryCategory === dna2.primaryCategory) {
            score += 0.5;

            // Comparação de Subcategoria (peso médio)
            if (dna1.subCategory === dna2.subCategory) {
                score += 0.3;

                // Comparação de Nicho (menor peso)
                if (dna1.niche === dna2.niche) {
                    score += 0.2;
                }
            }
        }

        // Bônus por tags em comum
        const commonTags = dna1.tags.filter(tag => dna2.tags.includes(tag));
        score += Math.min(commonTags.length * 0.05, 0.1); // Adiciona um pequeno bônus, com um teto

        return Math.min(score, 1.0); // Garante que a pontuação não exceda 1.0
    },

    /**
     * Obtém recomendações de uma lista de itens com base em um DNA de referência.
     * 
     * @param referenceDna - O DNA a ser usado como base para as recomendações.
     * @param items - Uma lista de posts ou itens de marketplace para filtrar e ordenar.
     * @param threshold - O limiar mínimo de similaridade para um item ser incluído (0 a 1). Default: 0.2
     * @returns Uma lista de itens ordenados por relevância (maior similaridade primeiro).
     */
    getRecommendations(
        referenceDna: ContentDNA,
        items: RecommendableItem[],
        threshold: number = 0.2
    ): RecommendableItem[] {
        if (!referenceDna) return [];

        return items
            .map(item => ({
                item,
                // Calcula a similaridade apenas se o item tiver um DNA
                similarity: item.dna ? this.calculateSimilarity(referenceDna, item.dna) : 0
            }))
            .filter(scoredItem => scoredItem.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .map(scoredItem => scoredItem.item);
    }
};