
import { commentService } from '../services/CommentService.js.js';
import { AppError } from '../utils/errors.js';

/**
 * @fileoverview Controlador para gerenciar as requisições HTTP relacionadas a comentários.
 */

class CommentController {

    /**
     * Lida com a busca de comentários para um item.
     * GET /api/:commentableType/:commentableId/comments
     */
    async getComments(req, res, next) {
        try {
            const { commentableId, commentableType } = req.params;
            const comments = await commentService.getCommentsForItem(commentableId, commentableType);
            res.status(200).json(comments);
        } catch (error) {
            next(error); // Passa o erro para o middleware de tratamento de erros
        }
    }

    /**
     * Lida com a criação de um novo comentário.
     * POST /api/:commentableType/:commentableId/comments
     */
    async postComment(req, res, next) {
        try {
            const { commentableId, commentableType } = req.params;
            const { content } = req.body;
            const authorId = req.user.id; // Assumindo que a autenticação anexa o usuário ao req

            if (!content) {
                throw new AppError('O conteúdo do comentário é obrigatório.', 400);
            }

            const newComment = await commentService.addComment({
                content,
                authorId,
                commentableId,
                commentableType
            });
            res.status(201).json(newComment);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Lida com a deleção de um comentário.
     * DELETE /api/comments/:commentId
     */
    async deleteComment(req, res, next) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id; // ID do usuário que está fazendo a requisição

            await commentService.deleteComment(commentId, userId);
            res.status(204).send(); // 204 No Content
        } catch (error) {
            next(error);
        }
    }
}

export const commentController = new CommentController();
