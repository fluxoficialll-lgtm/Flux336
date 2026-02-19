
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackingService } from '@/ServiçosDoFrontend/ServiçoDeTelemetria/trackingService.ts';
import { metaPixelService } from '@/ServiçosDoFrontend/ServiçoDeTelemetria/metaPixelService.ts';

export const GlobalTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Capturar UTMs da URL atual
    trackingService.captureUrlParams();

    // Track Page View Global (Pixel da Plataforma)
    // @ts-ignore
    const globalPixelId = process.env.VITE_PIXEL_ID || ""; 
    if (globalPixelId) {
      metaPixelService.trackPageView(globalPixelId);
    }
  }, [location]);

  return null;
};
