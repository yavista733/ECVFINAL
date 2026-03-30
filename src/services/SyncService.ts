import { supabaseConfig } from '../config/supabase';
import { httpService } from './HttpService';
import { getCurrentConnectivityState } from '../utils/connectivity';

class SyncService {
  async checkConnectivity(): Promise<boolean> {
    try {
      const state = await getCurrentConnectivityState();
      if (!state.isConnected) return false;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(
          `${supabaseConfig.url}/rest/v1/users?select=id&limit=1`,
          {
            headers: {
              apiKey: supabaseConfig.anonKey,
              Authorization: `Bearer ${supabaseConfig.anonKey}`,
            },
            signal: controller.signal,
          },
        );
        clearTimeout(timeoutId);
        return response.ok || response.status === 401;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    } catch {
      return false;
    }
  }

  async fetchRemote<T>(table: string, orderBy: string = 'updatedAt'): Promise<T[]> {
    try {
      const result = await httpService.get<T[]>(
        `/${table}?order=${orderBy}.desc`,
      );
      return result;
    } catch (error) {
      console.error(`❌ SyncService.fetchRemote(${table}):`, error);
      return [];
    }
  }

  async syncSingleToRemote(
    table: string,
    data: Record<string, any>,
  ): Promise<{ remoteId: number } | null> {
    try {
      const { id, remoteId, ...remoteData } = data;
      const result = await httpService.post<any[]>(`/${table}`, remoteData);
      if (result && result.length > 0) {
        return { remoteId: result[0].id };
      }
      return null;
    } catch (error) {
      console.error(`❌ SyncService.syncSingle(${table}):`, error);
      return null;
    }
  }

  async updateRemote(
    table: string,
    remoteId: number,
    data: Record<string, any>,
  ): Promise<boolean> {
    try {
      await httpService.patch(`/${table}?id=eq.${remoteId}`, data);
      return true;
    } catch (error) {
      console.error(`❌ SyncService.updateRemote(${table}):`, error);
      return false;
    }
  }

  async deleteRemote(table: string, remoteId: number): Promise<boolean> {
    try {
      await httpService.delete(`/${table}?id=eq.${remoteId}`);
      return true;
    } catch (error) {
      console.error(`❌ SyncService.deleteRemote(${table}):`, error);
      return false;
    }
  }

  mergeTasks<T extends { id: number; remoteId?: number | null; updatedAt: string }>(
    localItems: T[],
    remoteItems: T[],
  ): T[] {
    const mergedMap = new Map<number, T>();

    for (const local of localItems) {
      mergedMap.set(local.id, local);
    }

    for (const remote of remoteItems) {
      const localMatch = localItems.find((l) => l.remoteId === remote.id);
      if (localMatch) {
        const localDate = new Date(localMatch.updatedAt).getTime();
        const remoteDate = new Date(remote.updatedAt).getTime();
        if (remoteDate > localDate) {
          mergedMap.set(localMatch.id, { ...remote, id: localMatch.id, remoteId: remote.id });
        }
      } else {
        const newId = Date.now() + Math.floor(Math.random() * 1000);
        mergedMap.set(newId, { ...remote, id: newId, remoteId: remote.id });
      }
    }

    return Array.from(mergedMap.values());
  }
}

export const syncService = new SyncService();
