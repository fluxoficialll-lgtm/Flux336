
import { USE_MOCKS } from '../mocks';
import { chatService as RealChatService } from './real/chatService';
import { chatService as MockChatService } from './mocks/chatService';

// By removing the adapter, we ensure the real service's methods are used directly.
const getService = () => {
  if (USE_MOCKS) {
    return MockChatService;
  }
  return RealChatService;
};

export const chatService = getService();
