export { User, CreateUserDTO, UpdateUserDTO } from '../models/User';
export { Post, PostWithUser, CreatePostDTO, Reaction, PostType, ReactionType } from '../models/Post';
export { Comment, CommentWithUser, CreateCommentDTO } from '../models/Comment';
export {
  Conversation, ConversationWithPreview, Message, MessageWithUser,
  CreateMessageDTO, CreateConversationDTO,
} from '../models/Chat';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

export interface AuthContextType {
  user: import('../models/User').User | null;
  isLoading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, department?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface PostContextType {
  posts: import('../models/Post').PostWithUser[];
  isLoading: boolean;
  error: string | null;
  loadPosts: () => Promise<void>;
  createPost: (content: string, type?: import('../models/Post').PostType, imageUrl?: string, communityName?: string) => Promise<void>;
  toggleReaction: (postId: number, type: import('../models/Post').ReactionType) => Promise<void>;
  loadComments: (postId: number) => Promise<import('../models/Comment').CommentWithUser[]>;
  addComment: (postId: number, text: string) => Promise<void>;
}

export interface ChatContextType {
  conversations: import('../models/Chat').ConversationWithPreview[];
  isLoading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<import('../models/Chat').MessageWithUser[]>;
  sendMessage: (conversationId: number, text: string) => Promise<void>;
  createConversation: (participantIds: number[], title?: string) => Promise<number>;
}
