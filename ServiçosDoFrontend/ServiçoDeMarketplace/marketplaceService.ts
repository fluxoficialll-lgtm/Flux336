
import { USE_MOCKS } from '@/ServiçosDoFronte./mocks';
import { marketplaceService as RealMarketplaceService } from '@/ServiçosDoFrontend/ServiçoDeMarketplace/marketplaceService';
import { marketplaceService as MockMarketplaceService } from '\'./mocks/marketplaceService\''';

export const marketplaceService = USE_MOCKS ? MockMarketplaceService : RealMarketplaceService;
