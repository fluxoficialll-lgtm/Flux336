
import { PixelUserData, PixelEventData } from '../../../types/pixel.types';
import { authService } from '../../authService';
import { geoService } from '../../geoService';
import { trafficSource } from '../context/TrafficSource';
import { anonymizeUserData } from '../utils/pixelHasher';
import { Capacitor } from '@capacitor/core';

/**
 * PixelPayloadBuilder
 * Responsabilidade: Montar o "Super Payload" com máxima qualidade de match.
 */
export const pixelPayloadBuilder = {
  /**
   * Constrói o objeto de dados do usuário mesclando dados locais, cookies e geo.
   */
  async buildUserData(override?: PixelUserData): Promise<PixelUserData> {
    const user = authService.getCurrentUser();
    const utms = trafficSource.getOriginData();
    const geo = await geoService.detectCountry();

    const cookies = typeof document !== 'undefined' ? document.cookie.split(';').reduce((acc: any, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {}) : {};

    // 1. Dados Brutos (PII)
    const rawData: PixelUserData = {
      email: override?.email || user?.email || localStorage.getItem('guest_email_capture') || undefined,
      phone: override?.phone || user?.profile?.phone || undefined,
      firstName: override?.firstName || user?.profile?.nickname || user?.profile?.name || undefined,
      externalId: user?.id || undefined,
      city: geo?.countryCode === 'BR' ? undefined : geo?.countryName, // GeoIP simplificado
      country: geo?.countryCode || 'BR',
      userAgent: navigator.userAgent,
      fbp: cookies['_fbp'],
      fbc: cookies['_fbc'] || utms.fbclid,
      ip: geo?.ip || '0.0.0.0'
    };

    // 2. Aplica Hashing SHA-256 onde o Meta exige
    return await anonymizeUserData(rawData);
  },

  /**
   * Constrói os dados do evento com parâmetros de servidor e URL.
   */
  buildEventData(eventName: string, data: PixelEventData): PixelEventData {
    return {
      ...data,
      event_source_url: window.location.href,
      action_source: Capacitor.isNativePlatform() ? 'app' : 'website',
      // Injeta o código de teste se estiver em ambiente de homologação
      test_event_code: localStorage.getItem('meta_test_code') || undefined
    };
  }
};
