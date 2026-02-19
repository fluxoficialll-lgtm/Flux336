import { mockMode } from '@/ServiçosDoFrontend/ServiçoDeConfiguracao/envService';
import { eventCollectorService as mockEventCollectorService } from '@/mocks/eventCollectorService';
import { eventCollectorService as realEventCollectorService } from '@/ServiçosDoFrontend/ServiçoDeTelemetria/real_eventCollectorService';

export const eventCollectorService = mockMode ? mockEventCollectorService : realEventCollectorService;