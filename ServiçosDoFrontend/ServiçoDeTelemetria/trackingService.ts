import { mockMode } from '@/ServiçosDoFrontend/ServiçoDeConfiguracao/envService.ts';
import { trackingService as mockTrackingService, generateTrackingLinkModel as mockGenerateTrackingLinkModel } from '@/ServiçosDoFrontend/ServiçoDeSimulação/trackingService.ts';
import { trackingService as realTrackingService, generateTrackingLinkModel as realGenerateTrackingLinkModel } from '@/ServiçosDoFrontend/ServiçoDeTelemetria/real_trackingService.ts';

export const trackingService = mockMode ? mockTrackingService : realTrackingService;
export const generateTrackingLinkModel = mockMode ? mockGenerateTrackingLinkModel : realGenerateTrackingLinkModel;
export type { TrackingParams } from '@/ServiçosDoFrontend/ServiçoDeTelemetr../tipos.ts';