
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { bridgeLogger } from '../services/audit/bridgeLogger.js';
import { trafficLogger } from '../services/audit/trafficLogger.js';
import { heartbeatLogger } from '../services/audit/heartbeatLogger.js';
import { traceMiddleware } from '../middleware/traceMiddleware.js';

export const setupMiddlewares = (app, io) => {
    // 1. MIDDLEWARE DE RASTREAMENTO (O MAIS IMPORTANTE)
    // Deve ser o primeiro a ser registrado para garantir que CADA requisição
    // tenha um `traceId` antes de qualquer outro processamento ou log.
    app.use(traceMiddleware);

    // 2. MIDDLEWARES DE SEGURANÇA E PERFORMANCE
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        referrerPolicy: { policy: "no-referrer-when-downgrade" }
    }));

    app.use(cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type', 
            'Authorization', 
            'X-Requested-With', 
            'Accept', 
            'Origin', 
            'Cache-Control', 
            'X-Flux-Client-ID', 
            'x-flux-trace-id', // Nome do header em minúsculas por padrão no Express
            'X-Admin-Action',
            'X-Protocol-Version'
        ],
        exposedHeaders: ['x-flux-trace-id']
    }));

    app.use(compression());
    app.use(express.json({ limit: '50mb' })); 
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // 3. MIDDLEWARE DE LOGGING E CONTEXTO
    app.use((req, res, next) => {
        const start = Date.now();
        
        // Log de entrada (agora com traceId garantido pelo traceMiddleware)
        trafficLogger.logInbound(req);

        const clientId = req.headers['x-flux-client-id'];
        if (clientId) {
            heartbeatLogger.logPulse(clientId);
        }

        res.on('finish', () => {
            const duration = Date.now() - start;
            
            if (res.statusCode === 401 || res.statusCode === 403) {
                bridgeLogger.logAccessRefused(req, 'Unauthorized/Forbidden');
            } else if (req.path.includes('/admin/') && res.statusCode < 400) {
                bridgeLogger.logAccessGranted(req, 'ADMIN_ACCESS');
            }

            // Log de saída (agora com traceId garantido)
            trafficLogger.logOutbound(req, res, duration);
        });
        
        req.io = io;
        next();
    });

    app.set('trust proxy', 1);
    
    // 4. ERROR HANDLER GLOBAL (OBRIGATÓRIO)
    // Este deve ser o ÚLTIMO middleware, para capturar erros de toda a aplicação.
    app.use((error, req, res, next) => {
        // Usa o logger de erro estruturado, que inclui o traceId
        trafficLogger.logError(error, req);

        if (!res.headersSent) {
            res.status(500).json({
                message: 'Internal Server Error',
                // Devolve o traceId no corpo do erro para facilitar a correlação no cliente.
                trace_id: req.traceId 
            });
        }
    });
};
