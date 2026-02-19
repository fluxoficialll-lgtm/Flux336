
import { USE_MOCKS } from '@/mocks';
import { RealGroupService } from '@/ServiçosDoFrontend/ServiçoDeGrupos/RealGroupService';
import { MockGroupService } from '@/mocks/groupService';
import { IGroupService } from '@/ServiçosDoFrontend/ServiçoDeGrupos/groupService.interface.ts';

/**
 * O groupService exportado agora é uma decisão baseada no ambiente (Demo vs Real).
 * Isso remove a poluição de condicionais dentro da lógica de negócios.
 */
export const groupService: IGroupService = USE_MOCKS ? MockGroupService : RealGroupService;
