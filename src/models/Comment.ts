export interface Comment {
  id: number;
  postId: number;
  userId: number;
  text: string;
  parentCommentId: number | null;
  remoteId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithUser extends Comment {
  userDisplayName: string;
  userAvatarUrl: string;
}

export interface CreateCommentDTO {
  postId: number;
  text: string;
  parentCommentId?: number;
}
