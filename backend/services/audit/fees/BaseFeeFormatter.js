
/**
 * Loga um evento de auditoria financeira no formato JSON padronizado.
 * @param {string} provider - O nome do provedor (ex: "Stripe", "PayPal").
 * @param {object} data - O objeto de dados recebido, contendo as taxas.
 */
export const logFeeChange = (provider, data) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        direction: 'system',
        event_type: 'financial_audit',
        message: `Regra de taxa modificada para o provedor: ${provider}`,
        details: {
            provider: provider,
            change_type: data.change_type || 'update', // 'update', 'create', 'delete'
            rule_id: data.rule_id || 'N/A',
            fixed_fee: data.fixed_fee,
            percent_fee: data.percent_fee,
            description: data.description || 'Regra de taxa padrão'
        }
    };
    console.log(JSON.stringify(logEntry));
};
