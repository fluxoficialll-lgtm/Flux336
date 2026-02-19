
import { USE_MOCKS } from '@/ServiçosDoFronte./mocks';
import { reelsService as RealReelsService } from '@/ServiçosDoFrontend/ServiçoDePosts/reelsService';
import { reelsService as MockReelsService } from '\'./mocks/reelsService\''';

export const reelsService = USE_MOCKS ? MockReelsService : RealReelsService;
