import React from 'react';

interface ChatMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: () => void;
    onSelect: () => void;
    onBlock: () => void;
    onClear: () => void;
    onDeleteChat: () => void;
    isBlocked: boolean;
}

export const ChatMenuModal: React.FC<ChatMenuModalProps> = ({
    isOpen,
    onClose,
    onSearch,
    onSelect,
    onBlock,
    onClear,
    onDeleteChat,
    isBlocked
}) => {
    if (!isOpen) return null;

    const options = [
        { label: 'Pesquisar', icon: 'fa-solid fa-magnifying-glass', onClick: onSearch },
        { label: 'Selecionar Mensagens', icon: 'fa-solid fa-check-double', onClick: onSelect },
        { label: isBlocked ? 'Desbloquear Contato' : 'Bloquear Contato', icon: 'fa-solid fa-ban', onClick: onBlock },
        { label: 'Limpar Conversa', icon: 'fa-solid fa-eraser', onClick: onClear, isDestructive: true },
        { label: 'Apagar Conversa', icon: 'fa-solid fa-trash-can', onClick: onDeleteChat, isDestructive: true }
    ];

    return (
        <div 
            className="fixed inset-0 z-[100] bg-transparent"
            onClick={onClose}
        >
            <div 
                className="absolute top-[70px] right-4 w-[240px] bg-[#1a1e26] rounded-2xl p-2 shadow-2xl animate-pop-in border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-1">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                opt.onClick();
                                onClose();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                                opt.isDestructive 
                                ? 'hover:bg-red-500/10 text-red-400' 
                                : 'hover:bg-white/5 text-white'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                opt.isDestructive ? 'bg-red-500/20' : 'bg-[#00c2ff1a]'
                            }`}>
                                <i className={`${opt.icon} ${opt.isDestructive ? 'text-red-400' : 'text-[#00c2ff]'} text-sm`}></i>
                            </div>
                            <span className="font-bold text-sm">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
