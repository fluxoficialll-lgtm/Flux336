
import { SyncState } from '@/ServiçosDoFrontend/ServiçoDeSincronizacao/NucleoDeSincronizacao/SyncState';
import { SocialSyncWorker } from '@/ServiçosDoFrontend/ServiçoDeSincronizacao/Agentes/SocialSyncWorker';
import { SystemSyncWorker } from '@/ServiçosDoFrontend/ServiçoDeSincronizacao/Agentes/SystemSyncWorker';
import { BusinessSyncWorker } from '@/ServiçosDoFrontend/ServiçoDeSincronizacao/Agentes/BusinessSyncWorker';

/**
 * AccountSyncService (Orchestrator)
 * 
 * Gerencia o ciclo de vida dos dados do usuário logado.
 * Implementa delegação de responsabilidade para Workers especializados.
 */
export const AccountSyncService = {
    
    /**
     * Sincronização Pesada (Login / App Start)
     */
    async performFullSync() {
        console.log("🏗️ [Sync Orchestrator] Iniciando Sequência de Sincronização Total...");
        
        try {
            // 1. Fase Crítica: Social e Vital (Alta Prioridade)
            await Promise.all([
                SocialSyncWorker.syncHighPriority(),
                SystemSyncWorker.syncHighPriority(),
                BusinessSyncWorker.syncHighPriority()
            ]);

            // 2. Fase de Consistência (Baixa Prioridade)
            // Executamos em blocos para não fritar o processador do celular
            await SocialSyncWorker.syncLowPriority();
            await BusinessSyncWorker.syncLowPriority();

            SyncState.setFullSyncComplete();
            console.log("🏁 [Sync Orchestrator] Sincronização completa com sucesso.");
        } catch (error) {
            console.error("❌ [Sync Orchestrator] Erro crítico na sequência de sync:", error);
        }
    },

    /**
     * Sincronização Leve (Background / Batimento)
     */
    async performBackgroundSync() {
        console.log("🔄 [Sync Orchestrator] Batimento de Background...");
        
        // Em background, focamos apenas no que muda o estado da UI instantaneamente
        await Promise.all([
            SystemSyncWorker.syncHighPriority(), // Notificações e Ban
            BusinessSyncWorker.syncHighPriority(), // Saldo (Wallet)
            SocialSyncWorker.syncHighPriority() // Novas mensagens
        ]);

        SyncState.updateCheckpoint('global_background');
    }
};
