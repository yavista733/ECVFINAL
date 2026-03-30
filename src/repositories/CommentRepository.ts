import { Comment, CommentWithUser, CreateCommentDTO } from '../models/Comment';
import { executeQuery, executeSingleQuery, executeAction } from '../database/db';
import { syncService } from '../services/SyncService';
import { supabaseConfig } from '../config/supabase';

class CommentRepository {
  async getByPostId(postId: number): Promise<CommentWithUser[]> {
    try {
      const comments = await executeQuery(
        `SELECT c.*, u.displayName as userDisplayName, u.avatarUrl as userAvatarUrl
         FROM comments c JOIN users u ON c.userId = u.id
         WHERE c.postId = ?
         ORDER BY c.createdAt ASC`,
        [postId],
      );
      return comments.map((c: any) => ({
        ...c,
        userDisplayName: c.userDisplayName || '',
        userAvatarUrl: c.userAvatarUrl || '',
      }));
    } catch (error) {
      console.error('❌ CommentRepository.getByPostId:', error);
      throw error;
    }
  }

  async create(userId: number, dto: CreateCommentDTO): Promise<Comment> {
    try {
      const now = new Date().toISOString();
      const result = await executeAction(
        `INSERT INTO comments (postId, userId, text, parentCommentId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [dto.postId, userId, dto.text, dto.parentCommentId ?? null, now, now],
      );

      const newComment = await executeSingleQuery(
        'SELECT * FROM comments WHERE id = ?',
        [result.lastInsertRowId],
      );
      if (!newComment) throw new Error('Error al crear comentario');

      await executeAction(
        'UPDATE posts SET commentsCount = commentsCount + 1, updatedAt = ? WHERE id = ?',
        [now, dto.postId],
      );

      const isOnline = await syncService.checkConnectivity();
      if (isOnline && supabaseConfig.enableSync) {
        this.syncCommentAsync(newComment);
      }

      return newComment;
    } catch (error) {
      console.error('❌ CommentRepository.create:', error);
      throw error;
    }
  }

  async seedDemoComments(postId: number, userId: number): Promise<void> {
    try {
      const existing = await executeSingleQuery(
        'SELECT COUNT(*) as count FROM comments WHERE postId = ?',
        [postId],
      );
      if (existing && existing.count > 0) return;

      const now = new Date().toISOString();
      const demos = [
        'Great update! Looking forward to seeing the roadmap.',
        'Thanks for sharing, this is really exciting news!',
      ];

      for (const text of demos) {
        await executeAction(
          `INSERT INTO comments (postId, userId, text, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?)`,
          [postId, userId, text, now, now],
        );
      }
      console.log('✅ Comentarios demo creados');
    } catch (error) {
      console.error('❌ Error creando comentarios demo:', error);
    }
  }

  private syncCommentAsync(comment: any): void {
    (async () => {
      try {
        const result = await syncService.syncSingleToRemote('comments', {
          postId: comment.postId,
          userId: comment.userId,
          text: comment.text,
          parentCommentId: comment.parentCommentId,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        });
        if (result?.remoteId) {
          await executeAction(
            'UPDATE comments SET remoteId = ? WHERE id = ?',
            [result.remoteId, comment.id],
          );
        }
      } catch (error) {
        console.warn('⚠️ Error sincronizando comentario:', error);
      }
    })();
  }
}

export const commentRepository = new CommentRepository();