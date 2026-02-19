import { mockMode } from '@/ServiçosDoFrontend/ServiçoDeConfiguracao/envService';
import { socketService as mockSocketService } from '@/mocks/socketService';
import { socketService as realSocketService } from '@/ServiçosDoFrontend/ServiçoDeConexoes/real_socketService';

export const socketService = mockMode ? mockSocketService : realSocketService;
