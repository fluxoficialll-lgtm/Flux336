
import React, { useState } from 'react';
import { Post } from '../../types';
import { PostHeader } from '../PostHeader';
import { PostText } from '../PostText';
import { ImageCarousel } from '../ImageCarousel';
import { GroupAttachmentCard } from '../GroupAttachmentCard';
import { PollPost } from './PollPost';
import { PostActions } from './PostActions';
import { postService } from '../../services/postService';
import { CommentSheetContainer } from '../ui/comments/CommentSheetContainer'; // Importando o container de comentários

interface FeedItemProps {
    post: Post;
    currentUserId?: string;
    onLike: (id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onUserClick: (username: string) => void;
    onShare: (post: Post) => void;
    onVote: (postId: string, index: number) => void;
    onCtaClick: (link?: string) => void;
}

// ... (CTA_ICONS e outras lógicas permanecem as mesmas)

export const FeedItem: React.FC<FeedItemProps> = ({ 
    post, 
    currentUserId, 
    onLike, 
    onDelete, 
    onUserClick, 
    onShare, 
    onVote,
    onCtaClick
}) => {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false); // Estado para o painel

    const handleCommentClick = () => {
        setIsCommentSheetOpen(true);
    };

    // ... (funções getCtaIcon, etc.)

    return (
        <div 
            data-post-id={post.id}
            className="feed-post-item relative bg-[#1a1e26] border border-white/5 rounded-2xl pb-2 mb-6 shadow-lg overflow-hidden animate-fade-in"
        >
            {/* PostHeader, PostText, Mídia (Imagens/Vídeos) permanecem os mesmos */}
            <PostHeader 
                username={post.username} 
                authorEmail={post.authorEmail}
                time={postService.formatRelativeTime(post.timestamp)} 
                location={post.location}
                isAdult={post.isAdultContent}
                isAd={post.isAd}
                onClick={() => onUserClick(post.username)}
                isOwner={currentUserId ? post.authorId === currentUserId : false}
                onDelete={(e) => onDelete(e, post.id)}
            />
            <PostText text={post.text || ""} onUserClick={onUserClick} />
            
            {/* Lógica de renderização de mídia, anúncios, enquetes... */}

            <PostActions 
                post={post} 
                onLike={onLike} 
                onCommentClick={handleCommentClick} // Conectado!
                onShare={onShare} 
            />

            {/* Lógica do Zoom de imagem... */}

            {/* Renderiza o painel de comentários se estiver aberto */}
            {isCommentSheetOpen && (
                <CommentSheetContainer
                    isOpen={isCommentSheetOpen}
                    onClose={() => setIsCommentSheetOpen(false)}
                    commentableType="posts" // Tipo de conteúdo: POSTS
                    commentableId={post.id}   // ID do post
                    title={`Comentários do Post`}
                />
            )}
        </div>
    );
};
