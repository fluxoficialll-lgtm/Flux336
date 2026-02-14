
import { NotificationSettings, PaymentProviderConfig, User, SecuritySettings } from '../../types';
import { db } from '@/database';
import { API_BASE } from '../../apiConfig';
import { logService } from '../logService';
import { PreferenceManager } from './auth/PreferenceManager';

const API_USERS = `${API_BASE}/api/users`;

// Função auxiliar para formatar o nome do provedor para os logs
const formatProviderName = (providerId: string): string => {
    if (providerId.toLowerCase().includes('sync')) return 'Sync PAY';
    if (providerId.toLowerCase().includes('stripe')) return 'Stripe';
    if (providerId.toLowerCase().includes('paypal')) return 'PayPal';
    return providerId.toUpperCase(); // Fallback para outros casos
};

export const preferenceService = {
  updateNotificationSettings: async (email: string, settings: NotificationSettings) => {
      await PreferenceManager.updateNotificationSettings(email, settings);
  },

  updateSecuritySettings: async (email: string, settings: SecuritySettings) => {
      await PreferenceManager.updateSecuritySettings(email, settings);
  },

  updateLanguage: async (email: string, language: string) => {
      try {
          await fetch(`${API_USERS}/update`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, updates: { language } })
          });
      } catch (e) {
          console.warn("Language update failed on server, updating locally only.");
      }
      
      const user = await db.users.getByEmail(email);
      if (user) {
          await db.users.update(user.id, { language });
          const updatedUser = await db.users.get(user.id);
          localStorage.setItem('cached_user_profile', JSON.stringify(updatedUser));
          localStorage.setItem('app_language', language);
      }
  },

  updatePaymentConfig: async (email: string, config: PaymentProviderConfig) => {
      const user = await db.users.getByEmail(email);
      const hadConfig = user?.paymentConfigs && user.paymentConfigs[config.providerId];
      
      const updatedUser = await PreferenceManager.updatePaymentConfig(email, config);
      
      // Atualiza o cache local após a operação
      localStorage.setItem('cached_user_profile', JSON.stringify(updatedUser));
      
      const providerName = formatProviderName(config.providerId);

      if (!hadConfig) {
          logService.logEvent(`PostgreSQL Provedor ${providerName} Credenciais Metadados Adicionados. ✅`, { provider: config.providerId, user: email });
      } else {
          logService.logEvent(`PostgreSQL Provedor ${providerName} Credenciais Metadados Atualizados. 🔁`, { provider: config.providerId, user: email });
      }
  },

  deletePaymentProvider: async (email: string, providerId: string) => {
    const user = await db.users.getByEmail(email);
    if (!user || !user.paymentConfigs || !user.paymentConfigs[providerId]) {
        // Não faz nada se a configuração não existe
        return;
    }

    const updatedUser = await PreferenceManager.deletePaymentProvider(email, providerId);
    
    // Atualiza o cache local
    localStorage.setItem('cached_user_profile', JSON.stringify(updatedUser));

    const providerName = formatProviderName(providerId);
    logService.logEvent(`PostgreSQL Provedor ${providerName} Credenciais Metadados Apagados. 🗑️`, { provider: providerId, user: email });
  }
};
