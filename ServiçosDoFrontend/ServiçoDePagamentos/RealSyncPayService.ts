
import { USE_MOCKS } from '@/mocks';
import { syncPayService as RealSyncPayService } from '@/ServiçosDoFrontend/ServiçoDePagamentos/RealSyncPayService'; // Assuming the real service is in a separate file
import { syncPayService as MockSyncPayService } from '@/mocks/syncPayService';

export const syncPayService = USE_MOCKS ? MockSyncPayService : RealSyncPayService;
