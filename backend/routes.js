
import express from 'express';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import groupsRoutes from './routes/groups.js';
import messagesRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import socialRoutes from './routes/social.js';
import eventRoutes from './routes/events.js';
import marketplaceRoutes from './routes/marketplace.js';
import postsRoutes from './routes/posts.js';
import reelsRoutes from './routes/reels.js'; // Importando a rota de Reels
import adsRoutes from './routes/ads.js';
import screensRoutes from './routes/screens.js';
import moderationRoutes from './routes/moderation.js';
import trackingRoutes from './routes/tracking.js';
import rankingRoutes from './routes/ranking.js';
import profileRoutes from './routes/profile.js';
import fluxmapRoutes from './routes/fluxmap.js';
import credentialsRoutes from './routes/credentials.js';
import userRoutes from './routes/user.js';
import notificationRoutes from './routes/notifications.js';
import { commentRoutes } from './routes/commentRoutes.js'; // Importando as novas rotas de comentários

// Gateway specific routes
import syncpayRoutes from './routes/gateways/syncpay.js';
import stripeRoutes from './routes/gateways/stripe.js';
import paypalRoutes from './routes/gateways/paypal.js';

const router = express.Router();

// Handshake Route (Batimento)
router.get('/ping', (req, res) => res.send('pong'));

// BFF / Screens Aggregator
router.use('/screens', screensRoutes);

// Register modular routers
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/groups', groupsRoutes);
router.use('/messages', messagesRoutes);
router.use('/admin', adminRoutes);
router.use('/events', eventRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/posts', postsRoutes);
router.use('/reels', reelsRoutes); // Usando a rota de Reels
router.use('/ads', adsRoutes);
router.use('/moderation', moderationRoutes);
router.use('/tracking', trackingRoutes);
router.use('/ranking', rankingRoutes);
router.use('/profile', profileRoutes);
router.use('/fluxmap', fluxmapRoutes);
router.use('/credentials', credentialsRoutes);
router.use('/user', userRoutes);
router.use('/notifications', notificationRoutes);

// Mounting Gateways
router.use('/syncpay', syncpayRoutes);
router.use('/stripe', stripeRoutes);
router.use('/paypal', paypalRoutes);

// Mounting specific prefixes to maintain compatibility with frontend services
router.use('/', socialRoutes);
router.use('/', paymentRoutes);

// Montando as rotas de comentário na raiz para suportar URLs polimórficas
router.use('/', commentRoutes);

export default router;
