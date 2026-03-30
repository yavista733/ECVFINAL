import { CreateMessageDTO } from '../models/Chat';

class ChatService {
  validateMessage(text: string, conversationId: number): CreateMessageDTO {
    if (!text || text.trim().length === 0) {
      throw new Error('El mensaje no puede estar vacío');
    }
    if (text.trim().length > 1000) {
      throw new Error('El mensaje no puede superar los 1000 caracteres');
    }
    if (!conversationId || conversationId <= 0) {
      throw new Error('Conversación inválida');
    }
    return {
      conversationId,
      text: text.trim(),
    };
  }
}

export const chatService = new ChatService();