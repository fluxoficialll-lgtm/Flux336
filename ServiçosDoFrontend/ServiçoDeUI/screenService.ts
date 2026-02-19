import { USE_MOCKS } from '@/ServiçosDoFronte./mocks';
import { screenService as RealScreenService } from '@/ServiçosDoFrontend/ServiçoDeUI/screenService';
import { MockScreenService } from '\'./mocks/screenService\''';

export const screenService = USE_MOCKS ? MockScreenService : RealScreenService;
export type { BusinessDashboardData, AdminDashboardData } from './real/screenService';