
import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../ServiçosDoFrontend/commentService';
import { Comment, CommentableType } from '../types'; // Ajuste o caminho se necessário

/**
 * @fileoverview Hook customizado para gerenciar a lógica de comentários de um item.
 */

interface UseCommentsReturn {
    comments: Comment[];
    isLoading: boolean;
    error: Error | null;
    addComment: (content: string) => Promise<void>;
    removeComment: (commentId: number) => Promise<void>;
}

export const useComments = (commentableType: CommentableType, commentableId: string | number): UseCommentsReturn => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Função para buscar os comentários
    const fetchAndSetComments = useCallback(async () => {
        if (!commentableId) return;
        try {
            setIsLoading(true);
            const fetchedComments = await commentService.fetchComments(commentableType, commentableId);
            setComments(fetchedComments);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error('Falha ao buscar comentários:', err);
        } finally {
            setIsLoading(false);
        }
    }, [commentableType, commentableId]);

    // Efeito para buscar os comentários quando o ID do item muda
    useEffect(() => {
        fetchAndSetComments();
    }, [fetchAndSetComments]);

    /**
     * Adiciona um novo comentário.
     * A atualização é otimista para uma melhor experiência do usuário.
     * @param content - O texto do novo comentário.
     */
    const addComment = async (content: string) => {
        if (!content.trim()) return;

        // Simula um comentário temporário para UI otimista
        const tempId = Date.now();
        const optimisticComment: Comment = {
            id: tempId,
            content,
            author: { id: 'current_user', name: 'Você', avatar: '' }, // Simulação, idealmente viria do estado de autenticação
            createdAt: new Date().toISOString(),
            // Outras propriedades do seu tipo Comment
        } as Comment;

        setComments(prev => [optimisticComment, ...prev]);

        try {
            const newComment = await commentService.postComment(commentableType, commentableId, content);
            // Substitui o comentário otimista pelo comentário real do servidor
            setComments(prev => prev.map(c => (c.id === tempId ? newComment : c)));
        } catch (err) {
            setError(err as Error);
            // Reverte a atualização otimista em caso de erro
            setComments(prev => prev.filter(c => c.id !== tempId));
            console.error('Falha ao adicionar comentário:', err);
        }
    };

    /**
     * Remove um comentário.
     * @param commentId - O ID do comentário a ser removido.
     */
    const removeComment = async (commentId: number) => {
        const originalComments = comments;
        // Atualização otimista
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            await commentService.deleteComment(commentId);
        } catch (err) {
            setError(err as Error);
            // Reverte em caso de erro
            setComments(originalComments);
            console.error('Falha ao deletar comentário:', err);
        }
    };

    return { comments, isLoading, error, addComment, removeComment };
};
