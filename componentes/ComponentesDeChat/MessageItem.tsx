import React, { useRef, useState } from 'react';
import { ChatMessage } from '../../types';
import { LazyMedia } from '@/componentes/LazyMedia';
import { AudioPlayer } from './AudioPlayer';
import MessageActionsModal from './MessageActionsModal';
import { ReactionPicker } from './ReactionPicker'; // Import the new component

interface MessageItemProps {
    msg: ChatMessage;
    isMe: boolean;
    onReact: (messageId: number, reaction: string) => void; // Add onReact prop
    // ... other props
}

export const MessageItem: React.FC<MessageItemProps> = ({
    msg, isMe, onReact, // ... other props
}) => {
    const [isActionsModalVisible, setActionsModalVisible] = useState(false);
    const [isReactionPickerOpen, setReactionPickerOpen] = useState(false);

    const handleReactWithEmoji = (emoji: string) => {
        onReact(msg.id, emoji);
        setReactionPickerOpen(false);
    };
    
    // ... other handlers

    return (
        <>
            <div className={`message-container ...`}>
                {/* ... existing message bubble ... */}
                <div className="message-bubble ...">
                    {/* ... message content ... */}

                    {/* Reactions Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="reactions-container flex gap-1 absolute -bottom-4 left-2 z-10">
                            {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                <div key={emoji} className="reaction-emoji bg-gray-700/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs flex items-center gap-1 border border-gray-600/50">
                                    <span>{emoji}</span>
                                    <span className="font-bold text-white">{userIds.length}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                     {isReactionPickerOpen && (
                        <ReactionPicker onSelect={handleReactWithEmoji} onClose={() => setReactionPickerOpen(false)} />
                    )}
                </div>
            </div>

            <MessageActionsModal
                isVisible={isActionsModalVisible}
                onClose={() => setActionsModalVisible(false)}
                message={msg}
                isMyMessage={isMe}
                onReact={() => setReactionPickerOpen(true)} // Open picker from modal
                // ... other actions
            />
        </>
    );
};
