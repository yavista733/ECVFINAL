import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatContextType } from '../types';
import { ConversationWithPreview, MessageWithUser } from '../models/Chat';
import { chatRepository } from '../repositories/ChatRepository';
import { chatService } from '../services/ChatService';
import { useAuthContext } from './AuthContext';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext debe usarse dentro de ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      initChat();
    }
  }, [user]);

  const initChat = async () => {
    if (!user) return;
    await chatRepository.seedDemoConversations(user.id);
    await loadConversations();
  };

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await chatRepository.getConversations(user.id);
      setConversations(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (conversationId: number): Promise<MessageWithUser[]> => {
    if (!user) return [];
    try {
      return await chatRepository.getMessages(conversationId, user.id);
    } catch (err: any) {
      console.error('❌ Error cargando mensajes:', err);
      return [];
    }
  }, [user]);

  const sendMessage = useCallback(async (conversationId: number, text: string) => {
    if (!user) return;
    try {
      const dto = chatService.validateMessage(text, conversationId);
      await chatRepository.createMessage(user.id, dto);
      await loadConversations();
    } catch (err: any) {
      setError(err.message || 'Error enviando mensaje');
      throw err;
    }
  }, [user, loadConversations]);

  const createConversation = useCallback(async (
    participantIds: number[],
    title?: string,
  ): Promise<number> => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      const conversationId = await chatRepository.createConversation(user.id, {
        participantIds,
        title,
        isGroup: participantIds.length > 1,
      });
      await loadConversations();
      return conversationId;
    } catch (err: any) {
      setError(err.message || 'Error creando conversación');
      throw err;
    }
  }, [user, loadConversations]);

  const value: ChatContextType = {
    conversations,
    isLoading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};