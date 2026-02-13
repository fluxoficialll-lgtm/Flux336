
import { Post, MarketplaceItem, User } from '../../types';
import { FeedEngine } from './engines/FeedEngine';
import { ReelsEngine } from './engines/ReelsEngine';
import { MarketEngine } from './engines/MarketEngine';
import { EngineContext } from './types';
import { authService } from '../authService';
import { UserInterestService } from '../ai/user/UserInterestService';
import { RecommendationService } from '../ai/core/RecommendationService';

export const DiscoveryHub = {

    async getFeed(items: Post[]): Promise<Post[]> {
        const context = this.buildContext();
        const interestDna = await UserInterestService.getCurrentInterestDna();

        if (interestDna) {
            return RecommendationService.getRecommendations(interestDna, items) as Post[];
        } else {
            return FeedEngine.rank(items, context);
        }
    },

    async getReels(items: Post[]): Promise<Post[]> {
        const context = this.buildContext();
        const interestDna = await UserInterestService.getCurrentInterestDna();

        if (interestDna) {
            // Implementando o sistema de recomendação para Reels
            return RecommendationService.getRecommendations(interestDna, items) as Post[];
        } else {
            // Fallback para o motor de ranking de Reels
            return await ReelsEngine.rank(items, context);
        }
    },

    async getMarketplace(items: MarketplaceItem[]): Promise<MarketplaceItem[]> {
        const context = this.buildContext();
        const interestDna = await UserInterestService.getCurrentInterestDna();

        if (interestDna) {
            return RecommendationService.getRecommendations(interestDna, items) as MarketplaceItem[];
        } else {
            return MarketEngine.rank(items, context);
        }
    },

    buildContext(): EngineContext {
        const user = authService.getCurrentUser() || undefined;
        return {
            user,
            userEmail: user?.email,
        };
    }
};