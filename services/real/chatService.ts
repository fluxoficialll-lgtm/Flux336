
import { db } from '@/database';
import { sqlite } from '@/database/engine';
import { ChatMessage, ChatData, User } from '../../types';
import { authService } from '../authService';
import { API_BASE } from '../../apiConfig';
import { apiClient } from '../apiClient';

const API_URL = `${API_BASE}/api/messages`;

export const chatService = {

    // --- Funções de Sincronização e Acesso a Dados ---

    async syncChats(): Promise<void> {
        try {
            const chats = await apiClient.get<ChatData[]>(`/chats`);
            if (chats && chats.length > 0) {
                sqlite.upsertItems('chats', chats);
            }
        } catch (error) {
            console.error("Falha ao sincronizar chats:", error);
        }
    },

    getAllChats: (): ChatData[] => {
        return db.chats.getAll();
    },

    getChat: (chatId: string): ChatData | undefined => {
        const chat = db.chats.get(chatId);
        // Retornar uma estrutura de ChatData mesmo que vazia para evitar erros
        if (!chat) {
            return {
                id: chatId,
                messages: [],
                participants: [],
                type: 'group', // ou 'direct' dependendo da lógica
                unreadCount: 0
            };
        }
        return chat;
    },

    getChatById: (chatId: string): ChatData | undefined => {
        return db.chats.get(chatId);
    },

    sendMessage: (chatId: string, message: ChatMessage): void => {
        const chat = db.chats.get(chatId);
        if (chat) {
            const updatedMessages = [...(chat.messages || []), message];
            sqlite.upsertItems('chats', [{ ...chat, messages: updatedMessages }]);
        } else {
            const newChatData: ChatData = {
                id: chatId,
                type: 'group', 
                participants: [], 
                messages: [message],
                unreadCount: 1,
                lastMessage: message.text,
                lastMessageTimestamp: new Date().toISOString()
            };
            sqlite.upsertItems('chats', [newChatData]);
        }
    },

    markChatAsRead: (chatId: string): void => {
        const chat = db.chats.get(chatId);
        if (chat && Array.isArray(chat.messages)) {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) return;

            let needsUpdate = false;
            chat.messages.forEach(message => {
                // Considera a mensagem como não lida se não tiver a propriedade isRead
                if (message.senderEmail !== currentUser.email && (message.isRead === false || message.isRead === undefined)) {
                    message.isRead = true;
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                chat.unreadCount = 0;
                sqlite.upsertItems('chats', [chat]);
            }
        }
    },
    
    deleteMessages: (chatId: string, messageIds: number[], mode: 'me' | 'all'): Promise<void> => {
        return new Promise((resolve) => {
            const chat = db.chats.get(chatId);
            if (!chat) return resolve();
            
            const currentUserEmail = authService.getCurrentUserEmail();
            if (!currentUserEmail) return resolve();

            if (mode === 'me') {
                chat.messages.forEach(msg => {
                    if (messageIds.includes(msg.id)) {
                        msg.deletedBy = msg.deletedBy || [];
                        if (!msg.deletedBy.includes(currentUserEmail)) {
                            msg.deletedBy.push(currentUserEmail);
                        }
                    }
                });
            } else { // mode === 'all'
                chat.messages.forEach(msg => {
                    if (messageIds.includes(msg.id)) {
                        msg.text = 'Esta mensagem foi apagada';
                        msg.contentType = 'deleted';
                        msg.mediaUrl = undefined;
                        msg.reactions = {};
                    }
                });
            }
            
            sqlite.upsertItems('chats', [chat]);
            resolve();
        });
    },
    
    // --- Funções Auxiliares e de Interação ---

    reportMessage: (chatId: string, messageId: number, reason: string, comments: string) => {
        const chat = db.chats.get(chatId);
        if (chat) {
            const msgIndex = chat.messages.findIndex(m => m.id === messageId);
            if (msgIndex !== -1) {
                chat.messages[msgIndex].isReported = true;
                chat.messages[msgIndex].reportReason = reason;
                chat.messages[msgIndex].reportComments = comments;
                sqlite.upsertItems('chats', [chat]);
            }
        }
    },

    reactToMessage: (chatId: string, messageId: number, reaction: string) => {
        const chat = db.chats.get(chatId);
        const currentUser = authService.getCurrentUser();
        if (!chat || !currentUser) return;

        const msgIndex = chat.messages.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return;

        const message = chat.messages[msgIndex];
        message.reactions = message.reactions || {};

        // Remove a reação anterior do usuário, se houver
        Object.keys(message.reactions).forEach(key => {
            const userIndex = message.reactions[key].findIndex(u => u.id === currentUser.id);
            if (userIndex > -1) {
                message.reactions[key].splice(userIndex, 1);
                if (message.reactions[key].length === 0) {
                    delete message.reactions[key];
                }
            }
        });
        
        // Adiciona a nova reação
        if (!message.reactions[reaction]) {
            message.reactions[reaction] = [];
        }
        message.reactions[reaction].push({ id: currentUser.id, name: currentUser.profile.name });

        sqlite.upsertItems('chats', [chat]);
    },

    getUnreadCount: (): number => {
        const chats = db.chats.getAll();
        if (!Array.isArray(chats)) return 0;

        let unreadCount = 0;
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return 0;

        chats.forEach(chat => {
            if (chat && Array.isArray(chat.messages)) {
                chat.messages.forEach(message => {
                    if (message.senderEmail !== currentUser.email && !message.isRead) {
                        unreadCount++;
                    }
                });
            }
        });
        return unreadCount;
    },
};
