
import { authService } from './authService';

const API_URL = '/api/notifications';

// Definindo um tipo para a Notificação para usar no frontend
export interface Notification {
    id: number;
    user_id: string;
    type: string;
    data: any;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * @namespace notificationService
 * @description
 * Serviço para interagir com a API de notificações.
 */
export const notificationService = {
    /**
     * Busca as notificações do usuário logado.
     * @returns {Promise<Notification[]>}
     */
    async getNotifications(): Promise<Notification[]> {
        const token = authService.getToken();
        const res = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error('Failed to fetch notifications');
        }
        return res.json();
    },

    /**
     * Busca a contagem de notificações não lidas.
     * @returns {Promise<{ count: number }>}
     */
    async getUnreadCount(): Promise<{ count: number }> {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error('Failed to fetch unread count');
        }
        return res.json();
    },

    /**
     * Marca uma notificação como lida.
     * @param {number} notificationId - O ID da notificação a ser marcada como lida.
     * @returns {Promise<any>}
     */
    async markAsRead(notificationId: number): Promise<any> {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/${notificationId}/mark-as-read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error('Failed to mark notification as read');
        }
        return res.json();
    },
};
