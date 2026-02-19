
import { USE_MOCKS } from '@/ServiçosDoFronte./mocks';
import { paypalService as RealPaypalService } from '@/ServiçosDoFrontend/ServiçoDePagamentos/paypalService';
import { paypalService as MockPaypalService } from '\'./mocks/paypalService\''';

export const paypalService = USE_MOCKS ? MockPaypalService : RealPaypalService;
