import { createSearchKey, extractEquipment, determineMovementType } from './matcher';
import { createClient } from '@/lib/supabase/server';

export interface ExerciseData {
  name: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  equipment?: string;
  movement_type?: 'compound' | 'isolation';
}

/**
 * Find an existing exercise or create a new one based on the name
 * 
 * @param exerciseData The exercise data to find or create
 * @returns The exercise record and whether it was newly created
 */
export async function findOrCreateExercise(exerciseData: ExerciseData) {
  const supabase = createClient();
  const searchKey = createSearchKey(exerciseData.name);
  
  // First, try to find existing exercise
  const { data: existingExercise, error: findError } = await supabase
    .from('exercises')
    .select('*')
    .eq('search_key', searchKey)
    .single();
  
  // If found, return it
  if (existingExercise && !findError) {
    return { exercise: existingExercise, created: false };
  }
  
  // If not found (404 error is expected), create new exercise
  if (findError && findError.code === 'PGRST116') {
    // Determine equipment if not provided
    const equipment = exerciseData.equipment || extractEquipment(exerciseData.name);
    
    // Determine movement type if not provided
    const movement_type = exerciseData.movement_type || 
      determineMovementType(exerciseData.name, exerciseData.primary_muscles);
    
    const { data: newExercise, error: createError } = await supabase
      .from('exercises')
      .insert({
        name: exerciseData.name,
        search_key: searchKey,
        primary_muscles: exerciseData.primary_muscles,
        secondary_muscles: exerciseData.secondary_muscles || [],
        equipment: equipment.toLowerCase(),
        movement_type: movement_type
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create exercise: ${createError.message}`);
    }
    
    return { exercise: newExercise, created: true };
  }
  
  // Any other error
  throw new Error(`Database error: ${findError?.message}`);
}

/**
 * Get all exercises from the database
 * 
 * @returns Array of exercise records
 */
export async function getAllExercises() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
  
  if (error) {
    throw new Error(`Failed to fetch exercises: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get exercises filtered by primary muscles
 * 
 * @param muscles Array of muscle groups to filter by
 * @returns Array of matching exercise records
 */
export async function getExercisesByMuscles(muscles: string[]) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .contains('primary_muscles', muscles)
    .order('name');
  
  if (error) {
    throw new Error(`Failed to fetch exercises by muscles: ${error.message}`);
  }
  
  return data || [];
}
