import { mockMode } from '@/ServiçosDoFrontend/ServiçoDeConfiguracao/envService.ts';
import { socketService as mockSocketService } from '@/ServiçosDoFrontend/ServiçoDeSimulação/socketService.ts';
import { socketService as realSocketService } from '@/ServiçosDoFrontend/ServiçoDeConexoes/real_socketService.ts';

export const socketService = mockMode ? mockSocketService : realSocketService;
