
import express from 'express';
import { RepositoryHub } from '../database/RepositoryHub.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Assumindo que temos um middleware de autenticação

const router = express.Router();

// Middleware para garantir que o RepositoryHub está disponível
router.use((req, res, next) => {
    if (!req.hub) {
        req.hub = new RepositoryHub();
    }
    next();
});

/**
 * @route   GET /api/notifications
 * @desc    Busca todas as notificações para o usuário autenticado
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await req.hub.notificationRepository.findByUserId(req.user.id);
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Busca a contagem de notificações não lidas para o usuário autenticado
 * @access  Private
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await req.hub.notificationRepository.getUnreadCount(req.user.id);
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/notifications/:id/mark-as-read
 * @desc    Marca uma notificação específica como lida
 * @access  Private
 */
router.post('/:id/mark-as-read', authMiddleware, async (req, res) => {
    try {
        const success = await req.hub.notificationRepository.markAsRead(req.params.id);
        if (success) {
            res.json({ msg: 'Notification marked as read' });
        } else {
            res.status(404).json({ msg: 'Notification not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Nota: A rota para CRIAR notificações (POST /) não será exposta diretamente aqui.
// A criação de notificações será feita internamente por outros serviços/repositórios.
// Por exemplo, o PostRepository.addLike() chamaria diretamente NotificationRepository.create().
// Isso mantém a lógica de negócio coesa.

export default router;
