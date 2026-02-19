
import { USE_MOCKS } from '@/ServiçosDoFronte./mocks';
import { stripeService as RealStripeService } from './real/stripeService';
import { stripeService as MockStripeService } from './mocks/stripeService'';

export const stripeService = USE_MOCKS ? MockStripeService : RealStripeService;
