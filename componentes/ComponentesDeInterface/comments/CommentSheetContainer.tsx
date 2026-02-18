
import React, { useState } from 'react';
import { useComments } from '../../../hooks/useComments'; // Ajuste o caminho conforme sua estrutura
import { CommentSheet } from './CommentSheet';
import { CommentableType } from '../../../types";

interface CommentSheetContainerProps {
    isOpen: boolean;
    onClose: () => void;
    commentableType: CommentableType;
    commentableId: string | number;
    title?: string;
}

export const CommentSheetContainer: React.FC<CommentSheetContainerProps> = ({
    isOpen,
    onClose,
    commentableType,
    commentableId,
    title = "Comentários"
}) => {
    const { comments, isLoading, error, addComment, removeComment } = useComments(commentableType, commentableId);
    const [commentText, setCommentText] = useState('');

    const handleSend = async () => {
        if (!commentText.trim()) return;
        try {
            await addComment(commentText);
            setCommentText(''); // Limpa o input após o envio
        } catch (err) {
            console.error("Falha ao enviar comentário:", err);
            // Opcional: mostrar um erro para o usuário
        }
    };

    const handleDelete = async (commentId: string) => {
        // O hook useComments espera um number, então fazemos o parsing
        try {
            await removeComment(parseInt(commentId, 10));
        } catch (err) {
            console.error("Falha ao deletar comentário:", err);
        }
    };

    // TODO: A lógica de reply, like e user click precisa ser implementada
    // Por enquanto, passaremos funções vazias para satisfazer as props do CommentSheet
    const handleDummyAction = () => {
        console.log("Ação (like, reply, user click) não implementada.");
    };

    if (isLoading) {
        // Você pode retornar um loader mais sofisticado aqui
        return <div>Carregando comentários...</div>;
    }

    if (error) {
        // Você pode retornar um estado de erro mais sofisticado
        return <div>Erro ao carregar os comentários.</div>;
    }

    return (
        <CommentSheet
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            comments={comments}
            commentText={commentText}
            onCommentTextChange={setCommentText}
            onSend={handleSend}
            onDelete={handleDelete} // Passando a função de delete
            // Funções de placeholder para props não utilizadas ainda
            onLike={() => handleDummyAction()}
            onUserClick={() => handleDummyAction()}
            onReplyClick={() => handleDummyAction()}
            replyingTo={null}
            onCancelReply={() => handleDummyAction()}
            currentUserId={"current_user"} // Simulado, idealmente viria do seu hook de autenticação
        />
    );
};
