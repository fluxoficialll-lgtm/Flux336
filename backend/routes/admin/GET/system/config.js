
import { dbManager } from '../../../../databaseManager.js.js';

export default async (req, res) => {
    const defaultConfig = {
        maintenanceMode: false,
        minWithdrawalAmount: 5.00,
        activeGateways: ['syncpay', 'stripe']
    };

    try {
        const result = await dbManager.query("SELECT value FROM platform_settings WHERE key = 'system_config'");
        
        let config = { ...defaultConfig };

        if (result.rows && result.rows.length > 0) {
            const dbConfig = result.rows[0].value || {};
            config = {
                ...config,
                ...dbConfig
            };
        }
        
        // EMERGENCY BYPASS: Forçamos manutenção em FALSE para garantir o boot.
        // Se precisar de manutenção real, remova esta linha após recuperar o acesso.
        config.maintenanceMode = false;

        return res.json(config);
    } catch (e) {
        console.warn("⚠️ [Admin Config] Erro ao ler banco, enviando default seguro:", e.message);
        return res.json(defaultConfig);
    }
};
