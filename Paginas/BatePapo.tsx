
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatService } from '@/ServiçosDoFrontend/ServiçoDeChat/chatService';
import { ChatMessage, ChatData } from '@/types';
import { authService } from '@/ServiçosDoFrontend/ServiçoDeAutenticacao/authService';
import { db } from '@/database';
import { useModal } from '@/componentes/ComponentesDeInterface/ModalSystem';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { ChatHeader } from '@/componentes/ComponentesDeChat/ChatHeader';
import { ChatInput } from '@/componentes/ComponentesDeChat/ChatInput';
import { MessageItem } from '@/componentes/ComponentesDeChat/MessageItem';
import { MediaPreviewOverlay } from '@/componentes/ComponentesDeChat/MediaPreviewOverlay';
import { ChatMenuModal } from '@/componentes/ComponentesDeChat/ChatMenuModal';
import { useChatActions } from '@/hooks/useChatActions';
import { PinnedMessage } from '@/componentes/ComponentesDeChat/PinnedMessage';
import { ForwardMessageModal } from '@/componentes/ComponentesDeChat/ForwardMessageModal';
import { ReportMessageModal } from '@/componentes/ComponentesDeChat/ReportMessageModal';

export const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const chatId = id || '1';

  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const { showModal, hideModal } = useModal();

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const currentUserEmail = authService.getCurrentUserEmail()?.toLowerCase();

  const loadChatData = useCallback((isSilent = false) => {
    const data = chatService.getChat(chatId);
    setChatData(data);
  }, [chatId]);

  useEffect(() => {
    loadChatData();
    const unsub = db.subscribe('chats', () => loadChatData(true));
    return () => unsub();
  }, [loadChatData]);

  const handleOpenForwardModal = (message: ChatMessage) => {
    showModal(<ForwardMessageModal 
      messageToForward={message}
      onConfirm={(targetChatIds) => {
        chatService.forwardMessage(chatId, message.id, targetChatIds);
        hideModal();
      }}
    />);
  };

  const handleOpenReportModal = (message: ChatMessage) => {
    showModal(<ReportMessageModal 
      messageToReport={message}
      onConfirm={(reason, comments) => {
        chatService.reportMessage(chatId, message.id, reason, comments);
        hideModal();
      }}
    />)
  };

  const handleReact = (messageId: number, reaction: string) => {
    chatService.reactToMessage(chatId, messageId, reaction);
  };

  // ... other handlers

  return (
    <div className="messages-page h-[100dvh] flex flex-col overflow-hidden bg-gray-900 text-white">
      {/* Header, PinnedMessage, etc. */}
      
      <main style={{ flexGrow: 1, overflowY: 'auto' }}>
        <Virtuoso
          ref={virtuosoRef}
          data={chatData?.messages || []}
          itemContent={(index, msg) => (
            <MessageItem
                key={msg.id}
                msg={msg}
                isMe={msg.senderEmail?.toLowerCase() === currentUserEmail}
                onForward={handleOpenForwardModal}
                onReport={handleOpenReportModal}
                onReact={handleReact}
                // ... other actions
            />
          )}
        />
      </main>

      {/* ChatInput */}
    </div>
  );
};
