
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { bridgeLogger } from '../services/audit/bridgeLogger.js';
import { trafficLogger } from '../services/audit/trafficLogger.js';
import { heartbeatLogger } from '../services/audit/heartbeatLogger.js';

export const setupMiddlewares = (app, io) => {
    // Configuração do Helmet otimizada para Google Auth e Aplicações Híbridas
    app.use(helmet({
        contentSecurityPolicy: false, // Desabilitado para permitir scripts externos como o do Google
        crossOriginEmbedderPolicy: false,
        // CRÍTICO: Permite que o popup do Google se comunique com a aba principal
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        // Garante que o Google receba a origem correta da requisição
        referrerPolicy: { policy: "no-referrer-when-downgrade" }
    }));

    app.use(cors({
        origin: true, // Permite qualquer origem que envie credenciais (ideal para dev e múltiplos domínios)
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        // Adicionados cabeçalhos customizados usados pelo fluxClient e sistemas internos
        allowedHeaders: [
            'Content-Type', 
            'Authorization', 
            'X-Requested-With', 
            'Accept', 
            'Origin', 
            'Cache-Control', 
            'X-Flux-Client-ID', 
            'X-Flux-Trace-ID',
            'X-Admin-Action',
            'X-Protocol-Version'
        ],
        exposedHeaders: ['X-Flux-Trace-ID']
    }));

    app.use(compression());
    app.use(express.json({ limit: '50mb' })); 
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    app.use((req, res, next) => {
        const start = Date.now();
        const clientId = req.headers['x-flux-client-id'];

        // 1. Log de Entrada
        if (req.method === 'OPTIONS') {
            trafficLogger.logCors(req);
        } else {
            trafficLogger.logInbound(req);
        }

        if (clientId) {
            heartbeatLogger.logPulse(clientId);
        }

        // 2. Interceptor de Resposta (Saída)
        res.on('finish', () => {
            const duration = Date.now() - start;
            
            // Log de Bridge para Validação de Auth
            if (res.statusCode === 401 || res.statusCode === 403) {
                bridgeLogger.logAccessRefused(req, 'Unauthorized/Forbidden');
            } else if (req.path.includes('/admin/') && res.statusCode < 400) {
                bridgeLogger.logAccessGranted(req, 'ADMIN_ACCESS');
            }

            // Log de Tráfego de Saída
            trafficLogger.logOutbound(req, res, duration);
        });
        
        req.io = io;
        next();
    });

    app.set('trust proxy', 1);
};
