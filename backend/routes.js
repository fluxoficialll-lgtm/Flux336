
import express from 'express';
import authRoutes from './routes/auth.js.js';
import usersRoutes from './routes/users.js.js';
import groupsRoutes from './routes/groups.js.js';
import messagesRoutes from './routes/messages.js.js';
import adminRoutes from './routes/admin.js.js';
import paymentRoutes from './routes/payments.js.js';
import socialRoutes from './routes/social.js.js';
import eventRoutes from './routes/events.js.js';
import marketplaceRoutes from './routes/marketplace.js.js';
import postsRoutes from './routes/posts.js.js';
import reelsRoutes from './routes/reels.js.js'; // Importando a rota de Reels
import adsRoutes from './routes/ads.js.js';
import screensRoutes from './routes/screens.js.js';
import moderationRoutes from './routes/moderation.js.js';
import trackingRoutes from './routes/tracking.js.js';
import rankingRoutes from './routes/ranking.js.js';
import profileRoutes from './routes/profile.js.js';
import fluxmapRoutes from './routes/fluxmap.js.js';
import credentialsRoutes from './routes/credentials.js.js';
import userRoutes from './routes/user.js.js';
import notificationRoutes from './routes/notifications.js.js';
import { commentRoutes } from './routes/commentRoutes.js.js'; // Importando as novas rotas de comentários

// Gateway specific routes
import syncpayRoutes from './routes/gateways/syncpay.js.js';
import stripeRoutes from './routes/gateways/stripe.js.js';
import paypalRoutes from './routes/gateways/paypal.js.js';

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
