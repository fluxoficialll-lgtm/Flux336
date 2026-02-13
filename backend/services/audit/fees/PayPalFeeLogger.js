
import { logFeeChange } from './BaseFeeFormatter.js';

/**
 * PayPalFeeLogger
 * Formata e loga eventos de taxa específicos do PayPal.
 */
export const PayPalFeeLogger = {
    log(data) {
        // Detalhes específicos do PayPal podem ser adicionados aqui no futuro.
        logFeeChange('PayPal', data);
    }
};