import express from 'express';
import ReelsService from '../services/ReelsService.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('video'), async (req, res, next) => {
    try {
        const { description } = req.body;
        const file = req.file;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        const reelData = { userId, description };

        const newReel = await ReelsService.createReel(reelData, file);
        res.status(201).json(newReel);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const reel = await ReelsService.getReelById(req.params.id);
        if (!reel) {
            return res.status(404).send('Reel não encontrado.');
        }
        res.json(reel);
    } catch (error) {
        next(error);
    }
});

router.get('/user/:userId', async (req, res, next) => {
    try {
        const reels = await ReelsService.getReelsByUser(req.params.userId);
        res.json(reels);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        const reel = await ReelsService.getReelById(req.params.id);
        if (reel && reel.userId !== userId) {
            return res.status(403).send('Acesso negado. Você não é o proprietário deste Reel.');
        }

        await ReelsService.deleteReel(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
