
import { AdRepository } from '../database/repositories/AdRepository.js.js';
import { RecommendationService } from './ai/core/RecommendationService.js.js';

export const AdService = {

    /**
     * Cria um novo anúncio na plataforma.
     * @param {object} adData - Os dados do anúncio (título, conteúdo, targetDna, etc.).
     * @returns {Promise<boolean>} - True se o anúncio foi criado com sucesso.
     */
    async createAd(adData) {
        // Futuramente, aqui podemos adicionar validações,
        // processamento de pagamento de orçamento, etc.
        return AdRepository.create(adData);
    },

    /**
     * Encontra o anúncio mais relevante para um usuário com base no seu DNA de interesse.
     * @param {ContentDNA} userInterestDna - O DNA de interesse do usuário.
     * @returns {Promise<object|null>} - O anúncio mais relevante ou null se nenhum for encontrado.
     */
    async findBestAdForUser(userInterestDna) {
        // Passo 1: Buscar todos os anúncios ativos (simplificado por enquanto)
        // Em um sistema real, buscaríamos apenas anúncios com status 'active' e orçamento > 0.
        const allAds = await AdRepository.findAll(); // Precisamos implementar findAll no repositório.

        if (!allAds || allAds.length === 0) {
            return null;
        }

        // Passo 2: Usar o RecommendationService para encontrar o melhor anúncio.
        // O RecommendationService espera que cada item tenha uma propriedade 'dna'.
        const adsWithDna = allAds.map(ad => ({
            ...ad,
            dna: ad.targetDna // Mapeando targetDna para a propriedade 'dna' esperada.
        }));

        const recommendedAds = RecommendationService.getRecommendations(userInterestDna, adsWithDna);

        if (recommendedAds && recommendedAds.length > 0) {
            return recommendedAds[0]; // Retorna o anúncio mais relevante.
        }

        return null;
    },

    /**
     * Registra um evento de anúncio (ex: 'view' ou 'click').
     * @param {string} adId - O ID do anúncio.
     * @param {string} userId - O ID do usuário que interagiu.
     * @param {string} eventType - O tipo de evento ('view', 'click').
     * @returns {Promise<void>}
     */
    async recordAdEvent(adId, userId, eventType) {
        // Esta função usará AdAnalyticsRepository, que precisa ser verificado/criado.
        // Por enquanto, vamos focar na lógica de seleção do anúncio.
        console.log(`Evento '${eventType}' registrado para o anúncio ${adId} pelo usuário ${userId}`);
    }
};
