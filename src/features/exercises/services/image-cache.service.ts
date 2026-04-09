// @ts-nocheck
import * as FileSystem from 'expo-file-system';
import { WorkoutExercise } from '../types/exercise.types';

const CACHE_FOLDER = `${FileSystem.cacheDirectory}gymos_gifs/`;

/**
 * Intelligent Caching Service para GIFs.
 * Utiliza o expo-file-system para pré-carregar e referenciar GIFs
 * localmente, evitando que o consumo de RAM estoure com downloads massivos simultâneos.
 */
export const imageCacheService = {
  async init() {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });
    }
  },

  /**
   * Pre-fetch operation that downloads and replaces network URLs with local File URIs
   * only for the current workout session to save active memory.
   */
  async prefetchWorkoutGifs(exercises: WorkoutExercise[]): Promise<WorkoutExercise[]> {
    await this.init();
    
    const processedExercises = await Promise.all(
      exercises.map(async (ex) => {
        // Ignora se não for URL HTTP/S (ex: já for local)
        if (!ex.gifUrl.startsWith('http')) return ex;

        // Cria a hash/nome de arquivo baseado na URL da imagem e no ID do exercício
        const filename = `${ex.id}_${ex.gifUrl.split('/').pop() || 'anim.gif'}`;
        const fileUri = `${CACHE_FOLDER}${filename}`;

        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            // Download to caching directory
            await FileSystem.downloadAsync(ex.gifUrl, fileUri);
          }
          // Retorna a cópia do exercício com a URL local preenchida para uso rápido e offline
          return { ...ex, gifUrl: fileUri };
        } catch (e) {
          console.warn(`[ImageCache] Falha ao pre-fetchar GIF do ex ${ex.id}`, e);
          return ex; // Degradation: se o download falhar, cai pra rede
        }
      })
    );

    return processedExercises;
  },
  
  /**
   * Utility for memory cleanup 
   */
  async clearCache() {
    try {
      await FileSystem.deleteAsync(CACHE_FOLDER, { idempotent: true });
    } catch (e) {
      console.error("[ImageCache] Falha ao limpar diretório de cache", e);
    }
  }
};
