
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

// Rota para obter o ranking de seguidores
router.get('/followers', async (req, res) => {
    try {
        // Lógica para obter o ranking de seguidores do banco de dados
        const ranking = await dbManager.ranking.getFollowerRanking();
        res.json(ranking);
    } catch (error) {
        console.error('Erro ao obter ranking de seguidores:', error);
        res.status(500).json({ error: 'Falha ao obter o ranking.' });
    }
});

export default router;
