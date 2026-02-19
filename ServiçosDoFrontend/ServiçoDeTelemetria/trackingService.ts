import { mockMode } from '../ServiçoDeConfiguracao/envService';
import { trackingService as mockTrackingService, generateTrackingLinkModel as mockGenerateTrackingLinkModel } from '../ServiçoDeSimulação/trackingService';
import { trackingService as realTrackingService, generateTrackingLinkModel as realGenerateTrackingLinkModel } from './real_trackingService';

export const trackingService = mockMode ? mockTrackingService : realTrackingService;
export const generateTrackingLinkModel = mockMode ? mockGenerateTrackingLinkModel : realGenerateTrackingLinkModel;
export type { TrackingParams } from '@/ServiçosDoFrontend/ServiçoDeTelemetr../tipos.ts';