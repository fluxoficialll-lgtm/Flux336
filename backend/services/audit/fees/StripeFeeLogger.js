
import { logFeeChange } from './BaseFeeFormatter.js';

/**
 * StripeFeeLogger
 * Formata e loga eventos de taxa específicos do Stripe.
 */
export const StripeFeeLogger = {
    log(data) {
        // Poderíamos adicionar detalhes específicos do Stripe aqui se necessário.
        // Por enquanto, o formatador base é suficiente.
        logFeeChange('Stripe', data);
    }
};