
import express from 'express';
import fs from 'fs';
import path from 'path';
import { traceMiddleware } from '../middleware/traceMiddleware.js';
import { trafficLogger } from '../services/audit/trafficLogger.js';

const router = express.Router();

// Aplica middlewares globais para todas as rotas
router.use(traceMiddleware);
router.use((req, res, next) => {
    trafficLogger.logRequest(req);
    next();
});

const routesDir = path.dirname(import.meta.url).substring(7); // Remove 'file://'

// Carrega dinamicamente os arquivos de rota do diretório atual
fs.readdirSync(routesDir).forEach(async (file) => {
    // Considera apenas arquivos .js que não sejam este (index.js) e não sejam diretórios
    if (file.endsWith('.js') && file !== 'routes.js') {
        const fullPath = path.join(routesDir, file);
        const routeModule = await import(fullPath);
        
        // Deriva o "mount path" do nome do arquivo
        const routeName = path.basename(file, '.js');
        let mountPath;

        // Converte nomes como 'commentRoutes' para '/comments'
        if (routeName.endsWith('Routes')) {
            mountPath = `/${routeName.slice(0, -6)}s`;
        } else {
            mountPath = `/${routeName}`;
        }

        // Registra o módulo da rota no caminho derivado
        router.use(mountPath, routeModule.default);
    }
});

export default router;
