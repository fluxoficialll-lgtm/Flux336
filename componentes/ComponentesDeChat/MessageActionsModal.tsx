
import React from 'react';
import { ChatMessage } from '@/types';

interface MessageActionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  message: ChatMessage | null;
  isMyMessage: boolean;
  onDelete: (message: ChatMessage, type: 'me' | 'everyone') => void;
  onEdit: (message: ChatMessage) => void;
  onPin: (message: ChatMessage) => void;
  onCopy: (message: ChatMessage) => void;
  onForward: (message: ChatMessage) => void;
  onReply: (message: ChatMessage) => void;
  onReport: (message: ChatMessage) => void;
  onReact: (reaction: string) => void;
  onSilenceUser: (user: any) => void;
  onBlockUser: (user: any) => void;
  onStar: (message: ChatMessage) => void;
}

const MessageActionsModal: React.FC<MessageActionsModalProps> = ({
  isVisible,
  onClose,
  message,
  isMyMessage,
  onDelete,
  onEdit,
  onPin,
  onCopy,
  onForward,
  onReply,
  onReport,
  onReact,
  onSilenceUser,
  onBlockUser,
  onStar,
}) => {
  if (!isVisible || !message) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleCopyToClipboard = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text)
        .then(() => {
          // Optional: Show a success message
          console.log('Text copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
    onClose();
  };

  const ActionItem = ({ icon, text, onClick, isDestructive = false }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center text-left p-3 hover:bg-gray-700 rounded-lg transition-colors duration-150 ${isDestructive ? 'text-red-500' : 'text-white'}`}
    >
      <i className={`fa-solid ${icon} w-6 text-center`}></i>
      <span className="ml-4 text-base">{text}</span>
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gray-800 rounded-t-2xl shadow-lg p-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-around items-center border-b border-gray-700 pb-3 mb-3">
          {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleAction(() => onReact(emoji))}
              className="text-3xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          <ActionItem icon="fa-reply" text="Responder" onClick={() => handleAction(() => onReply(message))} />
          <ActionItem icon="fa-copy" text="Copiar Texto" onClick={handleCopyToClipboard} />
          <ActionItem icon="fa-share" text="Encaminhar" onClick={() => handleAction(() => onForward(message))} />
          <ActionItem icon="fa-thumbtack" text="Fixar" onClick={() => handleAction(() => onPin(message))} />
          <ActionItem icon="fa-star" text="Marcar como importante" onClick={() => handleAction(() => onStar(message))} />

          {isMyMessage && (
            <ActionItem icon="fa-pencil" text="Editar" onClick={() => handleAction(() => onEdit(message))} />
          )}

          <ActionItem
            icon="fa-trash"
            text="Apagar para mim"
            onClick={() => handleAction(() => onDelete(message, 'me'))}
            isDestructive
          />

          {isMyMessage && (
            <ActionItem
              icon="fa-trash-alt"
              text="Apagar para todos"
              onClick={() => handleAction(() => onDelete(message, 'everyone'))}
              isDestructive
            />
          )}

          {!isMyMessage && (
            <>
              <ActionItem
                icon="fa-triangle-exclamation"
                text="Denunciar"
                onClick={() => handleAction(() => onReport(message))}
                isDestructive
              />
              <ActionItem
                icon="fa-volume-xmark"
                text="Silenciar usuário"
                onClick={() => handleAction(() => onSilenceUser(message.senderId))}
                isDestructive
              />
              <ActionItem
                icon="fa-ban"
                text="Bloquear usuário"
                onClick={() => handleAction(() => onBlockUser(message.senderId))}
                isDestructive
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageActionsModal;
