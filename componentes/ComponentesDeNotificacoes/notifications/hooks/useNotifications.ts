
import { useState, useEffect } from 'react';
import { notificationService, Notification as NotificationType } from '@/ServiçosDoFrontend/notificationService';
import { db } from '../database'; // Importa a instância do banco de dados

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Carrega as notificações do cache local primeiro.
        const cachedNotifications = db.notifications.getAll();
        if (cachedNotifications && cachedNotifications.length > 0) {
            setNotifications(cachedNotifications);
        }
        setLoading(true); // Mantém o loading para a busca de dados frescos.

        const fetchAndCacheNotifications = async () => {
            try {
                // 2. Busca as notificações mais recentes da API.
                const fetched = await notificationService.getNotifications();
                
                if (Array.isArray(fetched)) {
                    // 3. Atualiza a UI com os dados frescos.
                    setNotifications(fetched);
                    
                    // 4. Salva as novas notificações no cache.
                    fetched.forEach(notification => {
                        db.notifications.add(notification);
                    });
                } else {
                    // Se a resposta da API não for um array, usa o que veio do cache.
                    setNotifications(cachedNotifications || []);
                }
                setError(null);

            } catch (err) {
                console.error("Falha ao buscar e cachear notificações:", err);
                setError('Não foi possível atualizar as notificações.');
            } finally {
                setLoading(false);
            }
        };

        fetchAndCacheNotifications();

    }, []);

    return { notifications, loading, error };
};
