import { getDatabase, executeAction } from './db';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await getDatabase();

    await executeAction(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        displayName TEXT NOT NULL,
        department TEXT DEFAULT '',
        role TEXT DEFAULT '',
        avatarUrl TEXT DEFAULT '',
        coverUrl TEXT DEFAULT '',
        followersCount INTEGER DEFAULT 0,
        followingCount INTEGER DEFAULT 0,
        communitiesCount INTEGER DEFAULT 0,
        remoteId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await executeAction(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        imageUrl TEXT DEFAULT '',
        type TEXT DEFAULT 'post',
        communityName TEXT DEFAULT '',
        viewsCount INTEGER DEFAULT 0,
        reactionsCount INTEGER DEFAULT 0,
        commentsCount INTEGER DEFAULT 0,
        sharesCount INTEGER DEFAULT 0,
        remoteId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await executeAction(`
      CREATE TABLE IF NOT EXISTS reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL,
        remoteId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(postId, userId)
      )
    `);

    await executeAction(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        text TEXT NOT NULL,
        parentCommentId INTEGER,
        remoteId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(parentCommentId) REFERENCES comments(id) ON DELETE CASCADE
      )
    `);

    await executeAction(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT DEFAULT '',
        isGroup INTEGER DEFAULT 0,
        remoteId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await executeAction(`
      CREATE TABLE IF NOT EXISTS conversation_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversationId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        remoteId INTEGER,
        FOREIGN KEY(conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(conversationId, userId)
      )
    `);

    await executeAction(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversationId INTEGER NOT NULL,
        senderId INTEGER NOT NULL,
        text TEXT NOT NULL,
        remoteId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY(senderId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tablas creadas correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};
