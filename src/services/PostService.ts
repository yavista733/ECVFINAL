import { CreatePostDTO, PostType } from '../models/Post';

class PostService {
  validatePost(content: string, type: PostType = 'post'): CreatePostDTO {
    if (!content || content.trim().length === 0) {
      throw new Error('El contenido es obligatorio');
    }
    if (content.length > 2000) {
      throw new Error('Maximo 2000 caracteres');
    }
    const validTypes: PostType[] = ['post', 'announcement', 'event'];
    if (!validTypes.includes(type)) {
      throw new Error('Tipo de post no valido');
    }
    return {
      content: content.trim(),
      type,
    };
  }
}

export const postService = new PostService();