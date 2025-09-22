-- Migration to change workout_focus from TEXT to TEXT[] to support multiple focus types
ALTER TABLE public.workouts 
  ALTER COLUMN workout_focus TYPE TEXT[] USING string_to_array(workout_focus, ',');

-- Update existing single values to be proper arrays
UPDATE public.workouts
SET workout_focus = ARRAY[workout_focus]
WHERE array_length(workout_focus, 1) IS NULL;
