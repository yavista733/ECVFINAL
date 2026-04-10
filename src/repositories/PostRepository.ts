import { Post, PostWithUser, CreatePostDTO, Reaction, ReactionType } from '../models/Post';
import { executeQuery, executeSingleQuery, executeAction } from '../database/db';
import { syncService } from '../services/SyncService';
import { supabaseConfig } from '../config/supabase';

class PostRepository {
  async getAll(currentUserId: number): Promise<PostWithUser[]> {
    try {
      const posts = await executeQuery(
        `SELECT p.*, u.displayName as userDisplayName, u.avatarUrl as userAvatarUrl, u.role as userRole
         FROM posts p JOIN users u ON p.userId = u.id
         ORDER BY p.createdAt DESC`,
      );

      const result: PostWithUser[] = [];
      for (const post of posts) {
        const reaction = await executeSingleQuery(
          'SELECT type FROM reactions WHERE postId = ? AND userId = ?',
          [post.id, currentUserId],
        );
        result.push({
          ...post,
          reactionsCount: post.reactionsCount || 0,
          commentsCount: post.commentsCount || 0,
          sharesCount: post.sharesCount || 0,
          viewsCount: post.viewsCount || 0,
          userDisplayName: post.userDisplayName || '',
          userAvatarUrl: post.userAvatarUrl || '',
          userRole: post.userRole || '',
          userReaction: reaction ? reaction.type : null,
        });
      }
      return result;
    } catch (error) {
      console.error('❌ PostRepository.getAll:', error);
      throw error;
    }
  }

  async getById(id: number, currentUserId: number): Promise<PostWithUser | null> {
    try {
      const post = await executeSingleQuery(
        `SELECT p.*, u.displayName as userDisplayName, u.avatarUrl as userAvatarUrl, u.role as userRole
         FROM posts p JOIN users u ON p.userId = u.id
         WHERE p.id = ?`,
        [id],
      );
      if (!post) return null;

      const reaction = await executeSingleQuery(
        'SELECT type FROM reactions WHERE postId = ? AND userId = ?',
        [post.id, currentUserId],
      );

      return {
        ...post,
        reactionsCount: post.reactionsCount || 0,
        commentsCount: post.commentsCount || 0,
        sharesCount: post.sharesCount || 0,
        viewsCount: post.viewsCount || 0,
        userDisplayName: post.userDisplayName || '',
        userAvatarUrl: post.userAvatarUrl || '',
        userRole: post.userRole || '',
        userReaction: reaction ? reaction.type : null,
      };
    } catch (error) {
      console.error('❌ PostRepository.getById:', error);
      throw error;
    }
  }

  async create(userId: number, dto: CreatePostDTO): Promise<Post> {
    try {
      const now = new Date().toISOString();
      const result = await executeAction(
        `INSERT INTO posts (userId, content, imageUrl, type, communityName, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, dto.content, dto.imageUrl || '', dto.type || 'post', dto.communityName || '', now, now],
      );

      const newPost = await executeSingleQuery('SELECT * FROM posts WHERE id = ?', [result.lastInsertRowId]);
      if (!newPost) throw new Error('Error al crear post');

      const isOnline = await syncService.checkConnectivity();
      console.log('🌐 isOnline:', isOnline, '| enableSync:', supabaseConfig.enableSync);
      console.log('🔑 URL:', supabaseConfig.url);
      console.log('🔑 Key length:', supabaseConfig.anonKey?.length);
      if (isOnline && supabaseConfig.enableSync) {
        this.syncPostAsync(newPost);
      }

      return newPost;
    } catch (error) {
      console.error('❌ PostRepository.create:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const post = await executeSingleQuery('SELECT remoteId FROM posts WHERE id = ?', [id]);
      await executeAction('DELETE FROM posts WHERE id = ?', [id]);

      if (post?.remoteId) {
        const isOnline = await syncService.checkConnectivity();
        if (isOnline && supabaseConfig.enableSync) {
          syncService.deleteRemote('posts', post.remoteId);
        }
      }
    } catch (error) {
      console.error('❌ PostRepository.delete:', error);
      throw error;
    }
  }

  async toggleReaction(postId: number, userId: number, type: ReactionType): Promise<void> {
    try {
      const existing = await executeSingleQuery(
        'SELECT id, type FROM reactions WHERE postId = ? AND userId = ?',
        [postId, userId],
      );

      if (existing) {
        if (existing.type === type) {
          await executeAction('DELETE FROM reactions WHERE id = ?', [existing.id]);
          await executeAction('UPDATE posts SET reactionsCount = MAX(0, reactionsCount - 1), updatedAt = ? WHERE id = ?', [new Date().toISOString(), postId]);
        } else {
          await executeAction('UPDATE reactions SET type = ? WHERE id = ?', [type, existing.id]);
        }
      } else {
        const now = new Date().toISOString();
        await executeAction(
          'INSERT INTO reactions (postId, userId, type, createdAt) VALUES (?, ?, ?, ?)',
          [postId, userId, type, now],
        );
        await executeAction('UPDATE posts SET reactionsCount = reactionsCount + 1, updatedAt = ? WHERE id = ?', [new Date().toISOString(), postId]);
      }
    } catch (error) {
      console.error('❌ PostRepository.toggleReaction:', error);
      throw error;
    }
  }

  async getReactionSummary(postId: number): Promise<string> {
    try {
      const reactors = await executeQuery(
        `SELECT u.displayName FROM reactions r JOIN users u ON r.userId = u.id
         WHERE r.postId = ? ORDER BY r.createdAt DESC LIMIT 2`,
        [postId],
      );
      if (reactors.length === 0) return '';
      return reactors.map((r: any) => r.displayName).join(', ');
    } catch {
      return '';
    }
  }

  async seedDemoPosts(userId: number): Promise<void> {
    try {
      const count = await executeSingleQuery('SELECT COUNT(*) as count FROM posts');
      if (count && count.count > 0) return;

      const now = new Date().toISOString();
      const posts = [
        { content: '¡Nos complace anunciar nuestra nueva hoja de ruta de productos para el segundo trimestre! Hemos recibido comentarios increíbles de nuestros beta testers y estamos deseando compartir las próximas novedades. ¡Muchísimas gracias a todo el equipo! 🚀', type: 'anuncio', community: 'General' },
        { content: '¡Excelente reunión de equipo hoy! Tengo muchas ganas de colaborar con todos en los próximos proyectos. ¡Hagamos que este trimestre sea increíble! 💪', type: 'correo', community: 'Ingeniería' },
        { content: '📢 ANUNCIO: Reunión general mañana a las 10 AM. Discutiremos los resultados del Q1 y nuestros planes para el resto del año. ¡Por favor, asegúrate de asistir!', type: 'anuncio', community: 'Anuncios' },
      ];

      for (const p of posts) {
        await executeAction(
          `INSERT INTO posts (userId, content, type, communityName, viewsCount, reactionsCount, commentsCount, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, p.content, p.type, p.community, Math.floor(Math.random() * 300), Math.floor(Math.random() * 50), Math.floor(Math.random() * 15), now, now],
        );
      }
      console.log('✅ Posts demo creados');
    } catch (error) {
      console.error('❌ Error creando posts demo:', error);
    }
  }

  private syncPostAsync(post: any): void {
    (async () => {
      try {
        const result = await syncService.syncSingleToRemote('posts', {
          userId: post.userId,
          content: post.content,
          imageUrl: post.imageUrl,
          type: post.type,
          communityName: post.communityName,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        });
        if (result?.remoteId) {
          await executeAction('UPDATE posts SET remoteId = ? WHERE id = ?', [result.remoteId, post.id]);
        }
      } catch (error) {
        console.warn('Error sincronizando post:', error);
      }
    })();
  }
}

export const postRepository = new PostRepository();