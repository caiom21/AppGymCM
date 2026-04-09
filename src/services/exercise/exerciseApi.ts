import axios from 'axios';
import { CircuitBreaker } from '@/src/shared/lib/circuit-breaker';
import { ExerciseApiError } from './exerciseTypes';
import type { ExerciseApiErrorCode } from './exerciseTypes';

/**
 * High-performance ExerciseDB API client using Axios.
 * Implements the SSOT pattern for v4.0 architecture.
 */

const API_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';
const API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || '';

// ── Axios Instance with RapidAPI Headers ──
const apiClient = axios.create({
  baseURL: `https://${API_HOST}`,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': API_HOST,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const circuitBreaker = new CircuitBreaker(5, 30_000);

// ── Error Classification Helper ──
function classifyError(status: number): ExerciseApiErrorCode {
  switch (status) {
    case 401: return 'AUTH_EXPIRED';
    case 404: return 'NOT_FOUND';
    case 429: return 'RATE_LIMITED';
    case 408: return 'TIMEOUT';
    default: return 'API_UNAVAILABLE';
  }
}

// ── API Wrapper Logic ──
async function request<T>(apiCall: () => Promise<{ data: T }>): Promise<T> {
  return circuitBreaker.call(
    async () => {
      try {
        const response = await apiCall();
        return response.data;
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status || 500;
          const code = classifyError(status);
          
          if (status === 429) {
             const retryAfter = parseInt(error.response?.headers['retry-after'] || '5', 10);
             throw new ExerciseApiError('Rate limited', 'RATE_LIMITED', 429, retryAfter);
          }
          
          throw new ExerciseApiError(error.message, code, status);
        }
        throw error;
      }
    },
    () => [] as any
  );
}

export const exerciseApi = {
  /**
   * Search by name (SSOT Requirement)
   */
  async searchByName(query: string, limit = 20): Promise<any[]> {
    const name = query.toLowerCase().trim();
    return request(() => apiClient.get(`/exercises/name/${name}`, { params: { limit } }));
  },

  /**
   * Filter by body part (SSOT Requirement)
   */
  async getByBodyPart(part: string, limit = 50): Promise<any[]> {
    const encoded = encodeURIComponent(part.toLowerCase());
    return request(() => apiClient.get(`/exercises/bodyPart/${encoded}`, { params: { limit } }));
  },

  /**
   * Filter by target muscle (SSOT Requirement)
   */
  async getByTarget(muscle: string, limit = 50): Promise<any[]> {
    const encoded = encodeURIComponent(muscle.toLowerCase());
    return request(() => apiClient.get(`/exercises/target/${encoded}`, { params: { limit } }));
  },

  /**
   * Filter by equipment (SSOT Requirement)
   */
  async getByEquipment(type: string, limit = 50): Promise<any[]> {
    const encoded = encodeURIComponent(type.toLowerCase());
    return request(() => apiClient.get(`/exercises/equipment/${encoded}`, { params: { limit } }));
  },

  /**
   * Get all exercises (paginated)
   */
  async getAll(limit = 50, offset = 0): Promise<any[]> {
    return request(() => apiClient.get('/exercises', { params: { limit, offset } }));
  },

  /**
   * Get exercise by ID
   */
  async getById(id: string): Promise<any> {
    return request(() => apiClient.get(`/exercises/exercise/${id}`));
  },

  async getBodyPartList(): Promise<string[]> {
    return request(() => apiClient.get('/exercises/bodyPartList'));
  },

  async getTargetList(): Promise<string[]> {
    return request(() => apiClient.get('/exercises/targetList'));
  },

  async getEquipmentList(): Promise<string[]> {
    return request(() => apiClient.get('/exercises/equipmentList'));
  }
};
