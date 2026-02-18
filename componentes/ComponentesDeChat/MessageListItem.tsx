import React from 'react';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
}

interface MessageListItemProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
  onAvatarClick: (e: React.MouseEvent) => void;
}

export const MessageListItem: React.FC<MessageListItemProps> = ({ contact, isSelected, onClick, onAvatarClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-3 transition-all duration-200 cursor-pointer ${
        isSelected ? 'bg-blue-500/30' : 'hover:bg-white/5'
      } ${
        contact.isPinned ? 'bg-gray-800/50' : ''
      }`}
    >
      <div onClick={onAvatarClick} className="relative flex-shrink-0">
        <img src={contact.avatar || 'https://via.placeholder.com/150'} alt={contact.name} className="w-14 h-14 rounded-full" />
        {contact.isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
        )}
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base truncate text-white">{contact.name}</h3>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{contact.time}</span>
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-400 truncate whitespace-pre-wrap max-w-[calc(100%-40px)]">{contact.lastMessage}</p>
          <div className="flex items-center gap-2">
            {contact.isMuted && <i className="fa-solid fa-bell-slash text-gray-500 text-xs"></i>}
            {contact.isPinned && <i className="fa-solid fa-thumbtack text-blue-400 text-xs"></i>}
            {contact.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {contact.unreadCount}
                </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
