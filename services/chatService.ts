import { chatService as RealChatService } from './real/chatService';

// Simplificando a exportação para usar diretamente o serviço real.
export const chatService = RealChatService;
