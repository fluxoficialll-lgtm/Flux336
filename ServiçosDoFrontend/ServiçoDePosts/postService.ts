
import { USE_MOCKS } from '@/ServiçosDoFronte./mocks';
import { postService as RealPostService } from './real/postService';
import { postService as MockPostService } from './mocks/postService'';

export const postService = USE_MOCKS ? MockPostService : RealPostService;
