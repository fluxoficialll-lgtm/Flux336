
import { logFeeChange } from './BaseFeeFormatter.js';

/**
 * SyncPayFeeLogger
 * Formata e loga eventos de taxa específicos do SyncPay.
 */
export const SyncPayFeeLogger = {
    log(data) {
        // Detalhes específicos do SyncPay podem ser adicionados aqui.
        logFeeChange('SyncPay', data);
    }
};