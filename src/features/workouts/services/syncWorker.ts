import NetInfo from '@react-native-community/netinfo';
import { useUserWorkoutsStore } from '../store/user-workouts.store';
import { supabase } from '@/src/shared/lib/supabase';
import { storage } from '@/src/shared/lib/mmkv';
import type { UserWorkout } from '@/src/shared/types/user-workout.types';

export const syncWorker = {
  /**
   * Inicializa o Listener de Rede para empurrar Workouts pendentes quando online.
   */
  init() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncPendingWorkouts();
      }
    });

    // Run cautiously on startup as well
    NetInfo.fetch().then(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncPendingWorkouts();
      }
    });
  },

  async syncPendingWorkouts() {
    const store = useUserWorkoutsStore.getState();
    const pendingIds = store.summaries
      .filter((w) => w.syncStatus === 'pending' || w.syncStatus === 'local_only')
      .map((w) => w.id);

    if (pendingIds.length === 0) return;

    console.log(`[SyncWorker] Found ${pendingIds.length} pending workouts.`);

    for (const id of pendingIds) {
      try {
        let fullWorkout: UserWorkout | undefined = store.getWorkout(id);
        
        if (!fullWorkout) {
          const raw = await storage.getString(`gymos_workout_${id}`);
          if (raw) {
            fullWorkout = JSON.parse(raw);
          }
        }

        if (!fullWorkout) continue;

        // Note: For multi-user architectures, user_id should be extracted correctly here, 
        // we'll mock auth mapping or assume fullWorkout.userId represents the internal ID vs Auth ID until wired.
        // Usually Supabase overrides `auth.uid()` at the edge but we must provide standard formatting.
        
        const payload = {
          id: fullWorkout.id,
          name: fullWorkout.name,
          description: fullWorkout.description || "",
          category: fullWorkout.category,
          day_of_week: fullWorkout.dayOfWeek,
          "order": fullWorkout.order,
          is_archived: fullWorkout.isArchived,
          exercises: fullWorkout.exercises, // Handled automatically as JSONB
          source_plan_id: fullWorkout.sourcePlanId,
          source_template_id: fullWorkout.sourceTemplateId,
          version: fullWorkout.version,
          sync_status: 'synced',
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('user_workouts')
          .upsert(payload, { onConflict: 'id' });

        if (!error) {
          store.markWorkoutSynced(id);
          console.log(`[SyncWorker] Successfully pushed ${id} to remote SSOT.`);
        } else {
          console.error(`[SyncWorker] Uplink Error for ${id}:`, error);
        }
      } catch (err) {
        console.error(`[SyncWorker] Failed execution phase for ${id}`, err);
      }
    }
  }
};
