
import { USE_MOCKS } from '../mocks';
import { notificationService as RealNotificationService } from './real/notificationService';
import { notificationService as MockNotificationService } from './mocks/notificationService';

// By removing the adapter, we ensure the real service's methods are used directly.
// The real service already has a `getUnreadCount` method, so no adapter is needed.
const getService = () => {
  if (USE_MOCKS) {
    return MockNotificationService;
  }
  return RealNotificationService;
};

export const notificationService = getService();
