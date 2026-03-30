import { User, CreateUserDTO } from '../models/User';
import { executeQuery, executeSingleQuery, executeAction } from '../database/db';
import { syncService } from './SyncService';
import { supabaseConfig } from '../config/supabase';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    if (!email || email.trim().length === 0) {
      throw new Error('El email es obligatorio');
    }
    if (!password || password.length < 6) {
      throw new Error('La contrasena debe tener al menos 6 caracteres');
    }

    const user = await executeSingleQuery(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()],
    );

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return this.mapUser(user);
  }

  async register(
    email: string,
    password: string,
    displayName: string,
    department: string = '',
  ): Promise<User> {
    if (!email || email.trim().length === 0) {
      throw new Error('El email es obligatorio');
    }
    if (!password || password.length < 6) {
      throw new Error('La contrasena debe tener al menos 6 caracteres');
    }
    if (!displayName || displayName.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    const existing = await executeSingleQuery(
      'SELECT id FROM users WHERE email = ?',
      [email.trim().toLowerCase()],
    );

    if (existing) {
      throw new Error('El email ya esta registrado');
    }

    const now = new Date().toISOString();
    const result = await executeAction(
      `INSERT INTO users (email, displayName, department, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [email.trim().toLowerCase(), displayName.trim(), department.trim(), now, now],
    );

    const newUser = await executeSingleQuery(
      'SELECT * FROM users WHERE id = ?',
      [result.lastInsertRowId],
    );

    if (!newUser) {
      throw new Error('Error al crear usuario');
    }

    const user = this.mapUser(newUser);

    const isOnline = await syncService.checkConnectivity();
    if (isOnline && supabaseConfig.enableSync) {
      this.syncUserAsync(user);
    }

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const row = await executeSingleQuery('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this.mapUser(row) : null;
  }

  async seedDemoUser(): Promise<void> {
    const existing = await executeSingleQuery(
      'SELECT id FROM users WHERE email = ?',
      ['demo@conexioncorp.com'],
    );
    if (existing) return;

    const now = new Date().toISOString();
    await executeAction(
      `INSERT INTO users (email, displayName, department, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['demo@conexioncorp.com', 'Jorge Ramirez', 'TI', 'Developer', now, now],
    );
    console.log('✅ Usuario demo creado');
  }

  private syncUserAsync(user: User): void {
    (async () => {
      try {
        const result = await syncService.syncSingleToRemote('users', {
          email: user.email,
          displayName: user.displayName,
          department: user.department,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
        if (result?.remoteId) {
          await executeAction(
            'UPDATE users SET remoteId = ? WHERE id = ?',
            [result.remoteId, user.id],
          );
        }
      } catch (error) {
        console.warn(`Error sincronizando usuario ${user.id}:`, error);
      }
    })();
  }

  private mapUser(row: any): User {
    return {
      ...row,
      followersCount: row.followersCount || 0,
      followingCount: row.followingCount || 0,
      communitiesCount: row.communitiesCount || 0,
      avatarUrl: row.avatarUrl || '',
      coverUrl: row.coverUrl || '',
      department: row.department || '',
      role: row.role || '',
    };
  }
}

export const authService = new AuthService();
