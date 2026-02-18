import React from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div 
        className="reaction-picker absolute z-10 -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800 p-2 rounded-full shadow-lg border border-gray-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing immediately
    >
      {EMOJIS.map(emoji => (
        <button 
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-2xl hover:scale-125 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
