export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) return 'El email es obligatorio';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return 'Email no valido';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.trim().length === 0) return 'La contrasena es obligatoria';
  if (password.length < 6) return 'Minimo 6 caracteres';
  return null;
};

export const validateDisplayName = (name: string): string | null => {
  if (!name || name.trim().length === 0) return 'El nombre es obligatorio';
  if (name.trim().length < 2) return 'Minimo 2 caracteres';
  if (name.length > 100) return 'Maximo 100 caracteres';
  return null;
};

export const validatePostContent = (content: string): string | null => {
  if (!content || content.trim().length === 0) return 'El contenido es obligatorio';
  if (content.length > 2000) return 'Maximo 2000 caracteres';
  return null;
};

export const validateMessage = (text: string): string | null => {
  if (!text || text.trim().length === 0) return 'El mensaje no puede estar vacio';
  if (text.length > 1000) return 'Maximo 1000 caracteres';
  return null;
};
