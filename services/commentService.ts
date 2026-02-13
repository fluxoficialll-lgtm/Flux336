
import { apiClient } from './apiClient';
import { Comment, CommentableType } from '../types'; 

const getComments = async (commentableType: CommentableType, commentableId: string | number): Promise<Comment[]> => {
    const { data } = await apiClient.get(`/${commentableType}/${commentableId}/comments`);
    return data;
};

const createComment = async (commentableType: CommentableType, commentableId: string | number, content: string): Promise<Comment> => {
    const { data } = await apiClient.post(`/${commentableType}/${commentableId}/comments`, { content });
    return data;
};

const deleteComment = async (commentableType: CommentableType, commentableId: string | number, commentId: number): Promise<void> => {
    await apiClient.delete(`/${commentableType}/${commentableId}/comments/${commentId}`);
};

export const commentService = {
    getComments,
    createComment,
    deleteComment,
};
