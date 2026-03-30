import { supabaseConfig } from '../config/supabase';

class HttpService {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = supabaseConfig.url;
    this.apiKey = supabaseConfig.anonKey;
    this.timeout = supabaseConfig.timeout;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      apiKey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      Prefer: 'return=representation',
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseUrl}/rest/v1${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
        signal: controller.signal,
      };

      if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      console.error(`❌ HttpService.${method} ${endpoint}:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, body);
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const httpService = new HttpService();
