
import React, { useState } from 'react';
import { Post, Group } from '@/types';
import { ReelPlayer } from '@/componentes/ComponentesDeReels/components/ReelPlayer';
import { ReelActions } from '@/componentes/ComponentesDeReels/components/ReelActions';
import { ReelInfo } from '@/componentes/ComponentesDeReels/components/ReelInfo';
import { CommentSheetContainer } from '@/componentes/ComponentesDeInterface/comments/CommentSheetContainer'; // Importando o container

interface ReelItemProps {
    reel: Post;
    isActive: boolean;
    isOwner: boolean;
    onLike: () => void;
    onShare: () => void;
    onDelete: () => void;
    onUserClick: () => void;
    getDisplayName: (name: string) => string;
    getUserAvatar: (name: string) => string | undefined;
    isExpanded: boolean;
    onToggleExpand: (e: React.MouseEvent) => void;
    reportWatchTime: (id: string) => void;
    onCtaClick: (link?: string) => void;
    onGroupClick: (groupId: string, group: Group) => void;
}

export const ReelItem: React.FC<ReelItemProps> = ({ 
    reel, isActive, isOwner, onLike, onShare, onDelete, onUserClick, 
    getDisplayName, getUserAvatar, isExpanded, onToggleExpand, reportWatchTime, 
    onCtaClick, onGroupClick 
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false); // Estado para o painel de comentários

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    // Abre o painel de comentários
    const handleCommentClick = () => {
        setIsCommentSheetOpen(true);
    };

    return (
        <div className="reel">
            <ReelPlayer 
                reel={reel}
                isActive={isActive}
                reportWatchTime={reportWatchTime}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onVideoClick={() => {}} 
            />

            <ReelActions 
                reel={reel}
                isOwner={isOwner}
                isMuted={isMuted}
                onLike={onLike}
                onComment={handleCommentClick} // Passa a função para abrir o painel
                onShare={onShare}
                onDelete={onDelete}
                onToggleMute={toggleMute}
            />

            <ReelInfo 
                reel={reel}
                displayName={getDisplayName(reel.username)}
                avatar={getUserAvatar(reel.username)}
                onUserClick={onUserClick}
                onGroupClick={onGroupClick}
                onCtaClick={onCtaClick}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
            />

            {/* Renderiza o painel de comentários se estiver aberto */}
            {isCommentSheetOpen && (
                <CommentSheetContainer
                    isOpen={isCommentSheetOpen}
                    onClose={() => setIsCommentSheetOpen(false)}
                    commentableType="reels" // Tipo de conteúdo
                    commentableId={reel.id}   // ID do conteúdo
                    title={`Comentários do Reel`}
                />
            )}
        </div>
    );
};
