
import { USE_MOCKS } from '../ServiçoDeSimulação';
import { RealGroupService } from './RealGroupService';
import { MockGroupService } from '../ServiçoDeSimulação/groupService';
import { IGroupService } from './groupService.interface.ts';

/**
 * O groupService exportado agora é uma decisão baseada no ambiente (Demo vs Real).
 * Isso remove a poluição de condicionais dentro da lógica de negócios.
 */
export const groupService: IGroupService = USE_MOCKS ? MockGroupService : RealGroupService;
