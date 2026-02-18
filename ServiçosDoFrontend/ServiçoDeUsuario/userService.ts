
import { USE_MOCKS } from '../mocks';
import { profileService as RealUserService } from './real/profileService';
// Import mock se existir: import { userService as MockUserService } from './mocks/userService';

// Por enquanto, não temos um mock para userService, então usamos o real diretamente.
// Se um mock for criado, a lógica pode ser: 
// export const userService = USE_MOCKS ? MockUserService : RealUserService;

export const userService = RealUserService;
