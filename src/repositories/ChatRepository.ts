import { Conversation, ConversationWithPreview, Message, MessageWithUser, CreateMessageDTO, CreateConversationDTO } from '../models/Chat';
import { executeQuery, executeSingleQuery, executeAction } from '../database/db';
import { syncService } from '../services/SyncService';
import { supabaseConfig } from '../config/supabase';

class ChatRepository {
  async getConversations(currentUserId: number): Promise<ConversationWithPreview[]> {
    try {
      const conversations = await executeQuery(
        `SELECT c.* FROM conversations c
         INNER JOIN conversation_members cm ON c.id = cm.conversationId
         WHERE cm.userId = ?
         ORDER BY c.updatedAt DESC`,
        [currentUserId],
      );

      const result: ConversationWithPreview[] = [];
      for (const conv of conversations) {
        const lastMsg = await executeSingleQuery(
          `SELECT m.text, m.createdAt, u.displayName as senderName
           FROM messages m JOIN users u ON m.senderId = u.id
           WHERE m.conversationId = ?
           ORDER BY m.createdAt DESC LIMIT 1`,
          [conv.id],
        );

        const members = await executeQuery(
          `SELECT u.displayName, u.avatarUrl FROM users u
           INNER JOIN conversation_members cm ON u.id = cm.userId
           WHERE cm.conversationId = ? AND u.id != ?`,
          [conv.id, currentUserId],
        );

        result.push({
          ...conv,
          lastMessage: lastMsg?.text || '',
          lastMessageTime: lastMsg?.createdAt || conv.createdAt,
          lastSenderName: lastMsg?.senderName || '',
          unreadCount: 0,
          participantNames: members.map((m: any) => m.displayName),
          participantAvatars: members.map((m: any) => m.avatarUrl),
        });
      }
      return result;
    } catch (error) {
      console.error('❌ ChatRepository.getConversations:', error);
      throw error;
    }
  }

  async getMessages(conversationId: number, currentUserId: number): Promise<MessageWithUser[]> {
    try {
      const messages = await executeQuery(
        `SELECT m.*, u.displayName as senderDisplayName, u.avatarUrl as senderAvatarUrl
         FROM messages m JOIN users u ON m.senderId = u.id
         WHERE m.conversationId = ?
         ORDER BY m.createdAt ASC`,
        [conversationId],
      );

      return messages.map((m: any) => ({
        ...m,
        senderDisplayName: m.senderDisplayName || '',
        senderAvatarUrl: m.senderAvatarUrl || '',
        isOwn: m.senderId === currentUserId,
      }));
    } catch (error) {
      console.error('❌ ChatRepository.getMessages:', error);
      throw error;
    }
  }

  async createMessage(senderId: number, dto: CreateMessageDTO): Promise<Message> {
    try {
      const now = new Date().toISOString();
      const result = await executeAction(
        `INSERT INTO messages (conversationId, senderId, text, createdAt)
         VALUES (?, ?, ?, ?)`,
        [dto.conversationId, senderId, dto.text, now],
      );

      await executeAction(
        'UPDATE conversations SET updatedAt = ? WHERE id = ?',
        [now, dto.conversationId],
      );

      const newMessage = await executeSingleQuery(
        'SELECT * FROM messages WHERE id = ?',
        [result.lastInsertRowId],
      );
      if (!newMessage) throw new Error('Error al crear mensaje');

      const isOnline = await syncService.checkConnectivity();
      if (isOnline && supabaseConfig.enableSync) {
        this.syncMessageAsync(newMessage);
      }

      return newMessage;
    } catch (error) {
      console.error('❌ ChatRepository.createMessage:', error);
      throw error;
    }
  }

  async createConversation(currentUserId: number, dto: CreateConversationDTO): Promise<number> {
    try {
      const now = new Date().toISOString();
      const result = await executeAction(
        `INSERT INTO conversations (title, isGroup, createdAt, updatedAt)
         VALUES (?, ?, ?, ?)`,
        [dto.title || '', dto.isGroup ? 1 : 0, now, now],
      );

      const conversationId = result.lastInsertRowId;
      const allParticipants = [...new Set([currentUserId, ...dto.participantIds])];

      for (const userId of allParticipants) {
        await executeAction(
          `INSERT OR IGNORE INTO conversation_members (conversationId, userId) VALUES (?, ?)`,
          [conversationId, userId],
        );
      }

      return conversationId;
    } catch (error) {
      console.error('❌ ChatRepository.createConversation:', error);
      throw error;
    }
  }

  async seedDemoConversations(currentUserId: number): Promise<void> {
    try {
      const count = await executeSingleQuery('SELECT COUNT(*) as count FROM conversations');
      if (count && count.count > 0) return;

      const now = new Date().toISOString();

      let user2Result = await executeSingleQuery(
        'SELECT id FROM users WHERE id != ? LIMIT 1',
        [currentUserId],
      );

      if (!user2Result) {
        const newUser = await executeAction(
          `INSERT INTO users (email, displayName, department, role, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['marcus@conexioncorp.com', 'Marcos lopez', 'Engineering', 'Tech Lead', now, now],
        );
        user2Result = { id: newUser.lastInsertRowId };
        console.log('✅ Usuario demo adicional creado');
      }

      const convResult = await executeAction(
        `INSERT INTO conversations (title, isGroup, createdAt, updatedAt) VALUES (?, 0, ?, ?)`,
        ['', now, now],
      );
      const convId = convResult.lastInsertRowId;

      await executeAction(
        `INSERT OR IGNORE INTO conversation_members (conversationId, userId) VALUES (?, ?)`,
        [convId, currentUserId],
      );
      await executeAction(
        `INSERT OR IGNORE INTO conversation_members (conversationId, userId) VALUES (?, ?)`,
        [convId, user2Result.id],
      );

      const demoMessages = [
        { senderId: user2Result.id, text: 'Hi! Have you reviewed the project timeline?' },
        { senderId: currentUserId, text: 'Yes, looks good overall!' },
        { senderId: user2Result.id, text: 'Great! Can we discuss Q2 milestones tomorrow?' },
      ];

      for (const msg of demoMessages) {
        await executeAction(
          `INSERT INTO messages (conversationId, senderId, text, createdAt) VALUES (?, ?, ?, ?)`,
          [convId, msg.senderId, msg.text, now],
        );
      }

      console.log('✅ Conversaciones demo creadas');
    } catch (error) {
      console.error('❌ Error creando conversaciones demo:', error);
    }
  }

  private syncMessageAsync(message: any): void {
    (async () => {
      try {
        const result = await syncService.syncSingleToRemote('messages', {
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
          createdAt: message.createdAt,
        });
        if (result?.remoteId) {
          await executeAction(
            'UPDATE messages SET remoteId = ? WHERE id = ?',
            [result.remoteId, message.id],
          );
        }
      } catch (error) {
        console.warn('⚠️ Error sincronizando mensaje:', error);
      }
    })();
  }
}

export const chatRepository = new ChatRepository();