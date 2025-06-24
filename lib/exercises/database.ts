import { createClient } from '@/lib/supabase/server';
import { createSearchKey, extractEquipment, determineMovementType } from './matcher';

// Define types locally to avoid circular dependencies
interface ExerciseData {
  name: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  equipment?: string;
  movement_type?: 'compound' | 'isolation';
}

interface ExerciseRecord extends ExerciseData {
  id: string;
  search_key: string;
  created_at: string;
  updated_at: string;
}

/**
 * Find an existing exercise or create a new one
 * 
 * @param exerciseData The exercise data to find or create
 * @returns The exercise record and whether it was newly created
 */
export async function findOrCreateExercise(exerciseData: ExerciseData): Promise<{
  exercise: ExerciseRecord;
  created: boolean;
}> {
  const supabase = createClient();
  const searchKey = createSearchKey(exerciseData.name);
  
  // Try to find an existing exercise with the same search key
  const { data: existingExercise, error: findError } = await supabase
    .from('exercises')
    .select('*')
    .eq('search_key', searchKey)
    .single();
  
  // If found, return it
  if (existingExercise && !findError) {
    return { exercise: existingExercise as ExerciseRecord, created: false };
  }
  
  // If not found (PGRST116 is the "no rows returned" error code)
  if (findError && findError.code === 'PGRST116') {
    // Determine equipment and movement type if not provided
    const equipment = exerciseData.equipment || extractEquipment(exerciseData.name);
    const movementType = exerciseData.movement_type || 
      determineMovementType(exerciseData.name, exerciseData.primary_muscles);
    
    // Create a new exercise
    const { data: newExercise, error: createError } = await supabase
      .from('exercises')
      .insert({
        name: exerciseData.name,
        search_key: searchKey,
        primary_muscles: exerciseData.primary_muscles,
        secondary_muscles: exerciseData.secondary_muscles || [],
        equipment,
        movement_type: movementType
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create exercise: ${createError.message}`);
    }
    
    return { exercise: newExercise as ExerciseRecord, created: true };
  }
  
  // Some other database error
  throw new Error(`Database error: ${findError?.message}`);
}

/**
 * Link an exercise to a workout with specific parameters
 * 
 * @param workoutId The workout ID
 * @param exerciseId The exercise ID
 * @param params The exercise parameters for this workout
 * @returns The created workout_exercise record
 */
export async function linkExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  params: {
    order_index: number;
    sets: number;
    reps: number;
    rest_seconds: number;
    weight_unit?: string;
    weight_recommendation_type?: string;
    weight_recommendation_value?: number;
    rationale?: string;
  }
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      order_index: params.order_index,
      sets: params.sets,
      reps: params.reps,
      rest_seconds: params.rest_seconds,
      weight_unit: params.weight_unit || 'lbs',
      weight_recommendation_type: params.weight_recommendation_type,
      weight_recommendation_value: params.weight_recommendation_value,
      rationale: params.rationale
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to link exercise to workout: ${error.message}`);
  }
  
  return data;
}

/**
 * Calculate workout summary fields based on exercises
 * 
 * @param exercises Array of exercises with their parameters
 * @returns Summary fields for the workout
 */
export function calculateWorkoutSummary(exercises: Array<{
  primary_muscles: string[];
  equipment?: string;
  sets: number;
  rest_seconds: number;
}>) {
  // Calculate total sets
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  
  // Count total exercises
  const totalExercises = exercises.length;
  
  // Collect all primary muscles (with duplicates)
  const allMuscles = exercises.flatMap(ex => ex.primary_muscles);
  
  // Remove duplicates to get unique targeted muscles
  const primaryMusclesTargeted = Array.from(new Set(allMuscles));
  
  // Collect unique equipment needed
  const equipmentNeeded = Array.from(new Set(
    exercises
      .map(ex => ex.equipment)
      .filter((eq): eq is string => eq !== undefined)
  ));
  
  // Estimate duration: sets * (avg exercise time + rest time)
  // Assume average of 30 seconds per set execution
  const avgSetTimeSeconds = 30;
  const totalRestSeconds = exercises.reduce((sum, ex) => sum + (ex.sets * ex.rest_seconds), 0);
  const estimatedDurationMinutes = Math.ceil(
    (totalSets * avgSetTimeSeconds + totalRestSeconds) / 60
  );
  
  return {
    total_sets: totalSets,
    total_exercises: totalExercises,
    primary_muscles_targeted: primaryMusclesTargeted,
    equipment_needed: equipmentNeeded,
    estimated_duration_minutes: estimatedDurationMinutes
  };
}
