import { mockMode } from '../ServiçoDeConfiguracao/envService';
import { socketService as mockSocketService } from '../ServiçoDeSimulação/socketService';
import { socketService as realSocketService } from './real_socketService';

export const socketService = mockMode ? mockSocketService : realSocketService;
