import { notificationService as RealNotificationService } from './real/notificationService';

// Simplificando a exportação para usar diretamente o serviço real.
export const notificationService = RealNotificationService;
