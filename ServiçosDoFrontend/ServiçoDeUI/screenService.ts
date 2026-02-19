import { USE_MOCKS } from '@/ServiçosDoFronte./mocks';
import { screenService as RealScreenService } from './real/screenService';
import { MockScreenService } from '\'./mocks/screenService\''';

export const screenService = USE_MOCKS ? MockScreenService : RealScreenService;
export type { BusinessDashboardData, AdminDashboardData } from './real/screenService';