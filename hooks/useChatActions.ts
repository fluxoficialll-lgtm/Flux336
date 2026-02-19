import { useMemo } from 'react';
import { chatService } from '@/ServiçosDoFrontend/chatService';
import { ChatMessage } from '@/types';

export const useChatActions = (chatId: string) => {

  const actions = useMemo(() => ({
    deleteMessage: async (message: ChatMessage, type: 'me' | 'everyone') => {
      await chatService.deleteMessages(chatId, [message.id], type);
    },
    editMessage: async (message: ChatMessage, newContent: string) => {
        // This is handled directly in Chat.tsx now, but could be moved here
        await chatService.editMessage(chatId, message.id, newContent);
    },
    pinMessage: async (message: ChatMessage) => {
      await chatService.pinMessage(chatId, message.id);
    },
    copyMessage: async (message: ChatMessage) => {
      if (!message.text) return;
      try {
        await navigator.clipboard.writeText(message.text);
        // Maybe show a toast notification here
      } catch (err) {
        console.error('Failed to copy message: ', err);
      }
    },
    forwardMessage: (message: ChatMessage) => {
      console.log(`ACTION: Forwarding message ${message.id}`);
      // Logic to open a contact picker and forward the message
    },
    replyToMessage: (message: ChatMessage) => {
        console.log(`ACTION: Replying to message ${message.id}`);
         // This is handled by state in Chat.tsx
    },
    reportMessage: async (message: ChatMessage) => {
      await chatService.reportMessage(chatId, message.id);
    },
    reactToMessage: async (message: ChatMessage, reaction: string) => {
      await chatService.reactToMessage(chatId, message.id, reaction);
    },
    silenceUser: async (userId: string) => {
      await chatService.silenceUser(userId);
    },
    blockUser: async () => {
      await chatService.blockUser(chatId);
    },
    starMessage: async (message: ChatMessage) => {
      await chatService.starMessage(chatId, message.id);
    },
  }), [chatId]);

  return actions;
};
