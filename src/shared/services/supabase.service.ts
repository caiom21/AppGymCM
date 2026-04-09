import { supabase } from "../lib/supabase";

export interface SupabasePlan {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  exercises: any[];
  is_active: boolean;
}

export interface SupabaseWorkoutSession {
  id: string;
  student_id: string;
  workout_id?: string;
  status: 'active' | 'completed' | 'canceled';
  started_at: string;
  ended_at?: string;
}

export interface SupabaseExerciseLog {
  id: string;
  session_id: string;
  workout_exercise_id?: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
  type?: string;
}

export const supabaseService = {
  // ── Plans ──
  async fetchUserPlans(userId: string) {
    const { data, error } = await supabase
      .from('user_workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async upsertPlan(userId: string, plan: any) {
    const { data, error } = await supabase
      .from('user_workouts')
      .upsert({
        ...plan,
        user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async upsertWorkoutExercises(exercises: any[]) {
    const { data, error } = await supabase
      .from('workout_exercises')
      .upsert(exercises, { onConflict: 'id' });
    
    if (error) throw error;
    return data;
  },

  // ── Sessions ──
  async startSession(userId: string, workoutId?: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        student_id: userId,
        workout_id: workoutId,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async finishSession(sessionId: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ── Logs ──
  async logSet(sessionId: string, log: any) {
    const { data, error } = await supabase
      .from('exercise_logs')
      .upsert({
        ...log,
        session_id: sessionId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ── Snapshots ──
  async fetchSnapshot(userId: string) {
    const { data, error } = await supabase
      .from('engine_snapshots')
      .select('*')
      .eq('student_id', userId)
      .maybeSingle(); // Better than choice between single/maybeSingle
    
    return { data, error };
  },

  async syncSnapshot(userId: string, sessionId: string, state: any) {
    const { data, error } = await supabase
      .from('engine_snapshots')
      .upsert({
        student_id: userId,
        session_id: sessionId,
        state: 'active',
        payload: state,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async clearSnapshot(userId: string) {
    const { error } = await supabase
      .from('engine_snapshots')
      .delete()
      .eq('student_id', userId);
    
    if (error) throw error;
  },

  // ── Stats ──
  async fetchUserStats(userId: string) {
    const { data: sessions, error: sError } = await supabase
      .from('workout_sessions')
      .select('id, started_at')
      .eq('student_id', userId)
      .eq('status', 'completed');
    
    if (sError) throw sError;

    if (!sessions || sessions.length === 0) {
      return { data: { totalVolume: 0, totalWorkouts: 0, sessions: [] } };
    }

    const { data: logs, error: lError } = await supabase
      .from('exercise_logs')
      .select('weight, reps')
      .in('session_id', sessions.map(s => s.id));
    
    if (lError) throw lError;

    const totalVolume = logs?.reduce((acc, log) => acc + (Number(log.weight) * Number(log.reps)), 0) || 0;
    const totalWorkouts = sessions.length;

    return { data: { totalVolume, totalWorkouts, sessions } };
  },

  async fetchPRs(userId: string) {
    // Get all completed logs for the user
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('student_id', userId)
      .eq('status', 'completed');
    
    if (!sessions || sessions.length === 0) return { data: [] };

    const { data: logs, error } = await supabase
      .from('exercise_logs')
      .select('weight, workout_exercise_id, created_at')
      .in('session_id', sessions.map(s => s.id))
      .order('weight', { ascending: false });

    if (error) throw error;

    // Filter to get max weight per exercise
    const prMap = new Map();
    logs?.forEach(log => {
      if (!prMap.has(log.workout_exercise_id)) {
        prMap.set(log.workout_exercise_id, log);
      }
    });

    return { data: Array.from(prMap.values()) };
  }
};
