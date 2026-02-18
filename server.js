
// Importa a configuração centralizada primeiro para garantir que as variáveis de ambiente sejam carregadas.
import { config, logger } from './backend/config.js';

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { initializeApp, cert } from 'firebase-admin/app';
import { randomUUID } from 'crypto';

import routes from './backend/routes.js';

// Inicialização do Firebase Admin usando a configuração importada
if (config.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
        const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccount)
        });
        logger.logSystem('info', 'Firebase Admin SDK inicializado com sucesso.');
    } catch (error) {
        logger.logSystem('error', 'Erro ao inicializar o Firebase Admin SDK: A chave FIREBASE_SERVICE_ACCOUNT_KEY parece estar mal formatada.', { error: error.message });
    }
}

const app = express();
const port = config.PORT;

// Confia no proxy reverso (Render, Heroku, etc) para obter o IP real do usuário.
app.set('trust proxy', 1);

// Middlewares de Segurança e Logging
app.use((req, res, next) => {
    const traceId = randomUUID();
    req.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);
    logger.logInbound(req);
    
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logOutbound(req, res, duration);
    });
    next();
});

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(hpp());

// CORS - agora usa a configuração do config.js
const corsOptions = {
    origin: config.ALLOWED_ORIGINS,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false, 
});
app.use('/api/', limiter);

// Rotas da API
app.use('/api', routes);

// Configuração do ambiente de desenvolvimento vs produção
if (config.NODE_ENV !== 'production') {
    // Modo de Desenvolvimento (proxy para Vite)
    app.use('/', createProxyMiddleware({
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
    }));
} else {
    // Modo de Produção (servir arquivos estáticos)
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
        res.sendFile('index.html', { root: 'dist' });
    });
}

// Iniciar o servidor
app.listen(port, () => {
    logger.logSystem('info', `Servidor rodando na porta ${port}` , { environment: config.NODE_ENV });
});
