
import { logFeeChange } from './BaseFeeFormatter.js';
import { StripeFeeLogger } from './StripeFeeLogger.js';
import { SyncPayFeeLogger } from './SyncPayFeeLogger.js';
import { PayPalFeeLogger } from './PayPalFeeLogger.js';

/**
 * FeeAuditOrchestrator
 * Direciona o log para o driver especializado e usa um fallback padronizado.
 */
export const FeeAuditOrchestrator = {
    log(data) {
        const provider = (data.provider || 'unknown').toLowerCase();
        
        // Os drivers específicos agora só precisam se preocupar em enriquecer o log.
        // A formatação base fica centralizada.
        switch (provider) {
            case 'stripe':
                StripeFeeLogger.log(data);
                break;
            case 'syncpay':
                SyncPayFeeLogger.log(data);
                break;
            case 'paypal':
                PayPalFeeLogger.log(data);
                break;
            default:
                // Fallback para qualquer provedor sem um logger especializado.
                // Garante que TODOS os logs de taxa sigam o padrão JSON.
                logFeeChange(provider, data);
                break;
        }
    }
};