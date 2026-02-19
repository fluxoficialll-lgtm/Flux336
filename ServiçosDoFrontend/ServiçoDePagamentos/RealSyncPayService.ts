
import { USE_MOCKS } from '.././mocks';
import { syncPayService as RealSyncPayService } from './RealSyncPayService'; // Assuming the real service is in a separate file
import { syncPayService as MockSyncPayService } from '../ServiçoDeSimulação/syncPayService';

export const syncPayService = USE_MOCKS ? MockSyncPayService : RealSyncPayService;
