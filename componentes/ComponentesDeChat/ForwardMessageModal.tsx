import React, { useState, useEffect } from 'react';
import { chatService } from '@/ServiçosDoFrontend/chatService';
import { ChatMessage, ChatData } from '@/componentes/types'';
import { useModal } from '@/componentes/ModalSystem';

interface ForwardMessageModalProps {
  messageToForward: ChatMessage | null;
  onConfirm: (targetChatIds: string[]) => void;
}

interface ChatContact {
    id: string;
    name: string;
    avatar?: string;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({ messageToForward, onConfirm }) => {
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const { showModal, hideModal } = useModal();

  useEffect(() => {
      const allChats = chatService.getAllChats();
      const contacts: ChatContact[] = allChats.map(chat => ({
          id: chat.id.toString(),
          name: chat.contactName,
      }));
      setChats(contacts);
      setSelectedChatIds([]);
  }, [messageToForward]);

  const handleToggleSelection = (chatId: string) => {
    setSelectedChatIds(prev =>
      prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]
    );
  };

  const handleConfirm = () => {
    if (selectedChatIds.length > 0) {
        onConfirm(selectedChatIds);
    }
    hideModal(); // Close modal after confirming
  };

  if (!messageToForward) return null;

  return (
    <div className="flex flex-col h-[60vh] w-full max-w-md mx-auto bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold text-white p-4 border-b border-gray-700">Encaminhar para...</h2>
        <div className="flex-grow overflow-y-auto p-4">
            {chats.map(chat => (
                <div 
                    key={chat.id}
                    onClick={() => handleToggleSelection(chat.id)}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChatIds.includes(chat.id) ? 'bg-blue-500/30' : 'hover:bg-white/5'
                    }`}>
                    <img src={chat.avatar || 'https://via.placeholder.com/150'} alt={chat.name} className="w-12 h-12 rounded-full" />
                    <span className="font-semibold text-white">{chat.name}</span>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-gray-700">
            <button 
                onClick={handleConfirm}
                disabled={selectedChatIds.length === 0}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-500 transition-colors"
            >
                Encaminhar ({selectedChatIds.length})
            </button>
        </div>
    </div>
  );
};
