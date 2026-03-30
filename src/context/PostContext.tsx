import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PostContextType } from '../types';
import { PostWithUser, ReactionType, PostType } from '../models/Post';
import { CommentWithUser } from '../models/Comment';
import { postRepository } from '../repositories/PostRepository';
import { postService } from '../services/PostService';
import { commentRepository } from '../repositories/CommentRepository';
import { useAuthContext } from './AuthContext';

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePostContext = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext debe usarse dentro de PostProvider');
  }
  return context;
};

interface PostProviderProps {
  children: React.ReactNode;
}

export const PostProvider = ({ children }: PostProviderProps) => {
  const { user } = useAuthContext();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      initPosts();
    }
  }, [user]);

  const initPosts = async () => {
    if (!user) return;
    await postRepository.seedDemoPosts(user.id);
    await loadPosts();
  };

  const loadPosts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const allPosts = await postRepository.getAll(user.id);
      setPosts(allPosts);
    } catch (err: any) {
      setError(err.message || 'Error cargando posts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createPost = useCallback(async (
    content: string,
    type: PostType = 'post',
    imageUrl?: string,
    communityName?: string,
  ) => {
    if (!user) return;
    try {
      const dto = postService.validatePost(content, type);
      dto.imageUrl = imageUrl;
      dto.communityName = communityName;
      await postRepository.create(user.id, dto);
      await loadPosts();
    } catch (err: any) {
      setError(err.message || 'Error creando post');
      throw err;
    }
  }, [user, loadPosts]);

  const toggleReaction = useCallback(async (postId: number, type: ReactionType) => {
    if (!user) return;
    try {
      await postRepository.toggleReaction(postId, user.id, type);
      await loadPosts();
    } catch (err: any) {
      console.error('Error en reaccion:', err);
    }
  }, [user, loadPosts]);

  const loadComments = useCallback(async (postId: number): Promise<CommentWithUser[]> => {
    try {
      return await commentRepository.getByPostId(postId);
    } catch (err: any) {
      console.error('❌ Error cargando comentarios:', err);
      return [];
    }
  }, []);

  const addComment = useCallback(async (postId: number, text: string) => {
    if (!user) return;
    try {
      await commentRepository.create(user.id, { postId, text });
      await loadPosts();
    } catch (err: any) {
      setError(err.message || 'Error al comentar');
      throw err;
    }
  }, [user, loadPosts]);

  const value: PostContextType = {
    posts,
    isLoading,
    error,
    loadPosts,
    createPost,
    toggleReaction,
    loadComments,
    addComment,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};