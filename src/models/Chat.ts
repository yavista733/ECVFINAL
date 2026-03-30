export interface Conversation {
  id: number;
  title: string;
  isGroup: boolean;
  remoteId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithPreview extends Conversation {
  lastMessage: string;
  lastMessageTime: string;
  lastSenderName: string;
  unreadCount: number;
  participantNames: string[];
  participantAvatars: string[];
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  remoteId: number | null;
  createdAt: string;
}

export interface MessageWithUser extends Message {
  senderDisplayName: string;
  senderAvatarUrl: string;
  isOwn: boolean;
}

export interface CreateMessageDTO {
  conversationId: number;
  text: string;
}

export interface CreateConversationDTO {
  participantIds: number[];
  title?: string;
  isGroup?: boolean;
}
