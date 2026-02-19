import { mockMode } from '@/ServiçosDoFrontend/ServiçoDeConfiguracao/envService';
import { trackingService as mockTrackingService, generateTrackingLinkModel as mockGenerateTrackingLinkModel } from '@/mocks/trackingService';
import { trackingService as realTrackingService, generateTrackingLinkModel as realGenerateTrackingLinkModel } from '@/ServiçosDoFrontend/ServiçoDeTelemetria/real_trackingService';

export const trackingService = mockMode ? mockTrackingService : realTrackingService;
export const generateTrackingLinkModel = mockMode ? mockGenerateTrackingLinkModel : realGenerateTrackingLinkModel;
export type { TrackingParams } from '@/ServiçosDoFrontend/ServiçoDeTelemetr../tipos.ts';