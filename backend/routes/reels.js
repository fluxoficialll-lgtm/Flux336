
const express = require('express');
const router = express.Router();
const ReelsService = require('../services/ReelsService');
const { authenticate } = require('../middleware'); // Middleware de autenticação
const multer = require('multer');

// Configuração do Multer para upload de arquivos em memória
// Isso é ideal para que o service possa bufferizar e enviar para o Cloudflare R2
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/reels:
 *   post:
 *     summary: Cria um novo Reel
 *     description: Faz o upload de um vídeo e cria os metadados do Reel. Requer autenticação.
 *     tags: [Reels]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: video
 *         type: file
 *         required: true
 *         description: O arquivo de vídeo para o Reel.
 *       - in: formData
 *         name: description
 *         type: string
 *         description: A legenda ou descrição para o Reel.
 *     responses:
 *       201: 
 *         description: Reel criado com sucesso.
 */
router.post('/', authenticate, upload.single('video'), async (req, res, next) => {
    try {
        const { description } = req.body;
        const file = req.file;
        const userId = req.user.id; // ID do usuário a partir do token de autenticação

        const reelData = { userId, description };

        const newReel = await ReelsService.createReel(reelData, file);
        res.status(201).json(newReel);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/reels/{id}:
 *   get:
 *     summary: Obtém um Reel pelo ID
 *     description: Retorna os detalhes de um Reel específico.
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: 
 *         description: Detalhes do Reel.
 *       404:
 *         description: Reel não encontrado.
 */
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

/**
 * @swagger
 * /api/reels/user/{userId}:
 *   get:
 *     summary: Obtém todos os Reels de um usuário
 *     description: Retorna uma lista de todos os Reels de um usuário específico.
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: 
 *         description: Lista de Reels do usuário.
 */
router.get('/user/:userId', async (req, res, next) => {
    try {
        const reels = await ReelsService.getReelsByUser(req.params.userId);
        res.json(reels);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/reels/{id}:
 *   delete:
 *     summary: Deleta um Reel
 *     description: Deleta um Reel pelo seu ID. Requer autenticação.
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204: 
 *         description: Reel deletado com sucesso.
 */
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        // Adicional: Verificar se o usuário que está deletando é o dono do Reel
        const userId = req.user.id;
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

module.exports = router;
