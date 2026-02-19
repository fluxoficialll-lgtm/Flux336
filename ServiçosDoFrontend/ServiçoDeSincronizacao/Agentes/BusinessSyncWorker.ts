
import { syncPayService } from '@/ServiçosDoFrontend/ServiçoDePagamentos/syncPayService';
import { adService } from '@/ServiçosDoFrontend/ServiçoDeAnuncios/adService';
import { marketplaceService } from '@/mocks/marketplaceService';
import { authService } from '@/ServiçosDoFrontend/ServiçoDeAutenticacao/authService';
import { db } from '@/database';
import { hydrationManager } from '@/ServiçosDoFrontend/ServiçoDeSincronizacao/HydrationManager';

export const BusinessSyncWorker = {
    name: 'BusinessWorker',

    async syncHighPriority() {
        const email = authService.getCurrentUserEmail();
        
        if (!email) {
            hydrationManager.markReady('WALLET');
            return;
        }

        try {
            // Saldo financeiro é alta prioridade (Efeito "Dinheiro na tela")
            await this.syncWallet(email);
        } catch (e) {
            console.warn("💰 [Sync] Falha na sincronização da carteira, operando local.");
        } finally {
            hydrationManager.markReady('WALLET');
        }
    },

    async syncLowPriority() {
        const email = authService.getCurrentUserEmail();
        if (!email) return;

        try {
            await Promise.all([
                this.syncMyAds(email),
                this.syncMyProducts(email)
            ]);
        } catch (e) {
            console.warn("💰 [Sync] Falha no background sync business.");
        }
    },

    async syncWallet(email: string) {
        const balance = await syncPayService.getBalance(email);
        const user = authService.getCurrentUser();
        if (user) {
            user.lastSeen = Date.now(); 
            // @ts-ignore
            user.walletBalance = balance;
            db.users.set(user);
        }
    },

    async syncMyAds(email: string) {
        await adService.getMyCampaigns();
    },

    async syncMyProducts(email: string) {
        // Implementação futura
    }
};
