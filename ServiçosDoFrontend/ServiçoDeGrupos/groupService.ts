
import { USE_MOCKS } from '@/ServiçosDoFrontend/ServiçoDeSimulação/index.ts';
import { RealGroupService } from './RealGroupService.ts';
import { MockGroupService } from '@/ServiçosDoFrontend/ServiçoDeSimulação/groupService.ts';
import { IGroupService } from './groupService.interface.ts';

/**
 * O groupService exportado agora é uma decisão baseada no ambiente (Demo vs Real).
 * Isso remove a poluição de condicionais dentro da lógica de negócios.
 */
export const groupService: IGroupService = USE_MOCKS ? MockGroupService : RealGroupService;
