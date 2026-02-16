
import express from 'express';
import { dbManager } from '../databaseManager.js';
import { decodeToken } from '../middleware/authMiddleware.js';
import { trafficLogger } from '../services/audit/trafficLogger.js';

const router = express.Router();

// Rota para criar um novo relatório (denúncia)
router.post('/reports', async (req, res, next) => {
    try {
        const { targetId, reporterId, reason } = req.body;
        if (!targetId || !reason) {
            return res.status(400).json({ error: "Dados obrigatórios para denúncia ausentes." });
        }
        await dbManager.reports.create({ targetId, reporterId, reason });
        res.status(201).json({ message: "Denúncia enviada com sucesso." });
    } catch (e) {
        // O erro agora é logado com o traceId e passado para o handler global
        next(e);
    }
});

// Rota para buscar os top 10 do ranking
router.get('/rankings/top', decodeToken, async (req, res, next) => {
    try {
        const result = await dbManager.ranking.getTop10();
        res.json(result);
    } catch (e) {
        // O erro agora é logado com o traceId e passado para o handler global
        next(e);
    }
});

export default router;
