
const ReelsRepository = require('../database/repositories/ReelsRepository');
const storageService = require('./storageService');
const { v4: uuidv4 } = require('uuid');

/**
 * Serviço para gerenciar a lógica de negócios relacionada a Reels.
 */
class ReelsService {

    /**
     * Cria um novo Reel, orquestrando o upload do vídeo e a gravação dos metadados.
     *
     * @param {object} reelData - Dados do Reel (ex: userId, description).
     * @param {object} file - O arquivo de vídeo a ser enviado (geralmente de um formulário multipart).
     * @returns {Promise<object>} O objeto do Reel recém-criado.
     */
    async createReel(reelData, file) {
        if (!file) {
            throw new Error('O arquivo de vídeo é obrigatório.');
        }

        // 1. Fazer o upload do arquivo para o serviço de armazenamento (Cloudflare R2)
        // Geramos um nome de arquivo único para evitar conflitos.
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `reels/${uuidv4()}.${fileExtension}`;

        const videoUrl = await storageService.uploadFile(file.buffer, fileName, file.mimetype);

        // 2. Preparar os metadados para salvar no Firestore.
        const newReelData = {
            ...reelData,
            videoUrl, // A URL do vídeo no Cloudflare R2
            storagePath: fileName, // Opcional: guardar o caminho para futuras manipulações (ex: deletar)
            likes: [],
            commentsCount: 0,
            createdAt: new Date(),
        };

        // 3. Chamar o repositório para salvar os metadados no banco de dados.
        const reelId = await ReelsRepository.create(newReelData);

        // Retornar o objeto completo do Reel recém-criado.
        return { id: reelId, ...newReelData };
    }

    /**
     * Busca um Reel pelo seu ID.
     * @param {string} reelId - O ID do Reel.
     * @returns {Promise<object|null>} O Reel encontrado ou null.
     */
    async getReelById(reelId) {
        return ReelsRepository.findById(reelId);
    }

    /**
     * Busca todos os Reels de um usuário.
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<Array<object>>} Uma lista de Reels.
     */
    async getReelsByUser(userId) {
        return ReelsRepository.findByUser(userId);
    }

    /**
     * Deleta um Reel, removendo o vídeo do armazenamento e os metadados do banco.
     * @param {string} reelId - O ID do Reel a ser deletado.
     * @returns {Promise<void>}
     */
    async deleteReel(reelId) {
        // Primeiro, buscar os metadados do Reel para encontrar o caminho do arquivo.
        const reel = await ReelsRepository.findById(reelId);
        if (!reel) {
            throw new Error('Reel não encontrado.');
        }

        // Se houver um caminho de armazenamento, deletar o arquivo do Cloudflare R2.
        if (reel.storagePath) {
            await storageService.deleteFile(reel.storagePath);
        }

        // Por fim, deletar os metadados do Reel do Firestore.
        await ReelsRepository.delete(reelId);
    }
    
    /**
     * Adiciona um like a um Reel.
     * @param {string} reelId - O ID do Reel.
     * @param {string} userId - O ID do usuário que deu o like.
     * @returns {Promise<void>}
     */
    async likeReel(reelId, userId) {
        // A lógica de negócio (ex: verificar se o usuário já curtiu) fica aqui.
        await ReelsRepository.addLike(reelId, userId);
        // Poderia também disparar uma notificação aqui.
    }
}

module.exports = new ReelsService();
