import React from 'react';
import { ChatMessage } from '../types'';

interface PinnedMessageProps {
  message: ChatMessage;
  onClick: () => void;
  onUnpin: () => void;
}

export const PinnedMessage: React.FC<PinnedMessageProps> = ({ message, onClick, onUnpin }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-gray-800/50 p-3 flex items-center justify-between cursor-pointer border-b border-gray-700/50"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <i className="fa-solid fa-thumbtack text-blue-400 text-sm"></i>
        <div className="overflow-hidden">
            <p className="text-xs text-blue-300 font-bold">Mensagem Fixada</p>
            <p className="text-sm text-gray-300 truncate">{message.text || 'Mídia'}</p>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onUnpin(); }} className="text-gray-400 hover:text-white transition-colors">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};
