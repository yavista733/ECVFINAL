export type PostType = 'post' | 'announcement' | 'event';
export type ReactionType = 'like' | 'celebrate' | 'support' | 'insightful';

export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl: string;
  type: PostType;
  communityName: string;
  viewsCount: number;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  remoteId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithUser extends Post {
  userDisplayName: string;
  userAvatarUrl: string;
  userRole: string;
  userReaction: ReactionType | null;
}

export interface CreatePostDTO {
  content: string;
  imageUrl?: string;
  type?: PostType;
  communityName?: string;
}

export interface Reaction {
  id: number;
  postId: number;
  userId: number;
  type: ReactionType;
  remoteId: number | null;
  createdAt: string;
}
