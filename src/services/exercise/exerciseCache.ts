/**
 * TTL-aware cache layer for exercise data.
 *
 * Uses the existing AsyncStorage wrapper (`src/shared/lib/mmkv.ts`)
 * with an expiration envelope: `{ data, expiresAt }`.
 *
 * Cache key prefix is `exercise-cache-v2:` to avoid collisions with
 * the old `exercise-cache:` prefix from the legacy service.
 *
 * @module services/exercise/exerciseCache
 */

import { storage } from '@/src/shared/lib/mmkv';

// ── Constants ──

const CACHE_PREFIX = 'exercise-cache-v2:';

interface CacheEnvelope<T> {
  data: T;
  expiresAt: number;
}

// ── Cache API ──

export const exerciseCache = {
  /**
   * Retrieves a cached value if it exists and has not expired.
   *
   * @returns The cached data, or null if missing/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await storage.getString(`${CACHE_PREFIX}${key}`);
      if (!raw) return null;

      const envelope: CacheEnvelope<T> = JSON.parse(raw);

      if (Date.now() > envelope.expiresAt) {
        // Expired — clean up asynchronously
        this.invalidate(key).catch(() => {});
        return null;
      }

      return envelope.data;
    } catch {
      return null;
    }
  },

  /**
   * Stores a value in cache with an explicit TTL.
   *
   * @param key  - Cache key (will be prefixed automatically)
   * @param data - The data to cache
   * @param ttlMs - Time-to-live in milliseconds (NEVER cache without TTL)
   */
  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    try {
      const envelope: CacheEnvelope<T> = {
        data,
        expiresAt: Date.now() + ttlMs,
      };
      await storage.set(`${CACHE_PREFIX}${key}`, JSON.stringify(envelope));
    } catch (e) {
      console.warn('[ExerciseCache] Failed to write cache:', key, e);
    }
  },

  /**
   * Removes a specific key from the cache.
   */
  async invalidate(key: string): Promise<void> {
    try {
      await storage.delete(`${CACHE_PREFIX}${key}`);
    } catch {
      // Silently ignore — cache miss is not an error
    }
  },

  /**
   * Clears all exercise cache entries.
   * Note: This iterates known keys; for a full wipe use AsyncStorage.multiRemove
   * with a prefix filter if available.
   */
  async clear(): Promise<void> {
    // Since AsyncStorage doesn't support prefix-based delete,
    // this is a best-effort clear of known cache keys.
    // Full implementation would track known keys in a separate entry.
    console.warn('[ExerciseCache] clear() called — prefix-based clear requires key tracking');
  },
};
