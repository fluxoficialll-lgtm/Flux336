
import React from 'react';
import { Link } from 'react-router-dom';
import { Notification as NotificationType } from '@/services/notificationService';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

// O componente NotificationItem permanece o mesmo, focado em apresentar uma notificação.
const NotificationItem: React.FC<{ notification: NotificationType }> = ({ notification }) => {
    // ... (lógica interna do item, sem alterações)
    const getNotificationMessage = (notif: NotificationType) => {
        if (!notif.data) return <span>Você tem uma nova notificação.</span>;

        const userLink = notif.data.followerId ? (
            <Link to={`/user/${notif.data.followerId}`} className="font-bold text-blue-400 hover:underline">
                {notif.data.followedBy || 'Alguém'}
            </Link>
        ) : <span className="font-bold">{notif.data.likedBy || notif.data.commentedBy || 'Alguém'}</span>;

        const postLink = notif.data.postId ? (
            <Link to={`/posts/${notif.data.postId}`} className="text-blue-400 hover:underline">publicação</Link>
        ) : 'publicação';

        switch (notif.type) {
            case 'new_like':
                return <span>{userLink} curtiu sua {postLink}.</span>;
            case 'new_comment':
                return <span>{userLink} comentou em sua {postLink}.</span>;
            case 'new_follower':
                return <span>{userLink} começou a seguir você.</span>;
            default:
                return <span>Você tem uma nova notificação.</span>;
        }
    };

    return (
        <div className={`p-3 border-b border-gray-700 ${notification.is_read ? 'text-gray-400' : 'text-white bg-gray-800'}`}>
            {getNotificationMessage(notification)}
            <div className="text-xs text-gray-500 mt-1">
                {new Date(notification.created_at).toLocaleString()}
            </div>
        </div>
    );
};

/**
 * Componente da Página de Notificações, agora refatorado para usar o hook useNotifications.
 * A responsabilidade é apenas de apresentação.
 */
export const Notifications: React.FC = () => {
    // A lógica complexa é substituída por uma única linha.
    const { notifications, loading, error } = useNotifications();

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="p-4 border-b border-gray-800">
                <h1 className="text-xl font-bold">Notificações</h1>
            </header>

            <main>
                {loading && <div className="p-4 text-center">Carregando...</div>}
                {error && <div className="p-4 text-center text-red-500">{error}</div>}
                {!loading && !error && (
                    notifications.length > 0 ? (
                        notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)
                    ) : (
                        <div className="p-4 text-center text-gray-400">Nenhuma notificação ainda.</div>
                    )
                )}
            </main>
        </div>
    );
};
