
import { CommentRepository } from '../database/repositories/CommentRepository.js';
import { NotFoundError, AppError } from '../utils/errors.js';

/**
 * @fileoverview Serviço para gerenciar a lógica de negócios relacionada a comentários.
 * Atua como intermediário entre os controladores e o repositório de comentários.
 */

class CommentService {

    /**
     * Obtém todos os comentários para um item específico.
     * @param {number} commentableId - ID do item (post, reel, etc.).
     * @param {'post' | 'reel' | 'product'} commentableType - Tipo do item.
     * @returns {Promise<Array<object>>}
     */
    async getCommentsForItem(commentableId, commentableType) {
        // Validação básica
        if (!commentableId || !commentableType) {
            throw new AppError('ID e Tipo do item são obrigatórios para buscar comentários.', 400);
        }
        return await CommentRepository.findByCommentable(commentableId, commentableType);
    }

    /**
     * Adiciona um novo comentário a um item.
     * @param {object} commentData - Dados do comentário.
     * @param {string} commentData.content - Conteúdo do comentário.
     * @param {string} commentData.authorId - ID do autor.
     * @param {number} commentData.commentableId - ID do item sendo comentado.
     * @param {'post' | 'reel' | 'product'} commentData.commentableType - Tipo do item.
     * @returns {Promise<object>} O comentário criado.
     */
    async addComment(commentData) {
        if (!commentData.content || !commentData.content.trim()) {
            throw new AppError('O conteúdo do comentário não pode estar vazio.', 400);
        }
        // O repositório já lida com o erro de banco de dados, o serviço adiciona a lógica de negócio.
        return await CommentRepository.create(commentData);
    }

    /**
     * Deleta um comentário.
     * @param {number} commentId - ID do comentário a ser deletado.
     * @param {string} userId - ID do usuário que está tentando deletar (para verificação de permissão).
     * @returns {Promise<object>} O comentário deletado.
     */
    async deleteComment(commentId, userId) {
        // O repositório já contém a lógica para garantir que apenas o autor possa deletar.
        // Se no futuro houver moderadores, essa lógica seria adicionada aqui no serviço.
        return await CommentRepository.delete(commentId, userId);
    }
}

export const commentService = new CommentService();
