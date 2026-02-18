import { mockMode } from '../ServiçoDeConfiguracao/envService';
import { eventCollectorService as mockEventCollectorService } from '../ServiçoDeSimulação/eventCollectorService';
import { eventCollectorService as realEventCollectorService } from './real_eventCollectorService';

export const eventCollectorService = mockMode ? mockEventCollectorService : realEventCollectorService;