-- This script fixes constraint issues on the exercises table
-- It removes the unique constraint on search_key and replaces it with a non-unique index
-- It also completely removes the movement_type column as it's not needed

-- First, check if the exercises table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'exercises'
  ) THEN
    -- Drop the unique constraint on search_key if it exists
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'exercises_search_key_key'
    ) THEN
      ALTER TABLE public.exercises DROP CONSTRAINT exercises_search_key_key;
    END IF;

    -- Drop the unique index if it exists
    IF EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE indexname = 'exercises_search_key_idx'
    ) THEN
      DROP INDEX IF EXISTS exercises_search_key_idx;
    END IF;
    
    -- Drop the movement_type check constraint if it exists
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'exercises_movement_type_check'
    ) THEN
      ALTER TABLE public.exercises DROP CONSTRAINT exercises_movement_type_check;
    END IF;
    
    -- Drop the movement_type column if it exists
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'exercises' AND column_name = 'movement_type'
    ) THEN
      ALTER TABLE public.exercises DROP COLUMN movement_type;
    END IF;

    -- Create a non-unique index for search_key
    CREATE INDEX IF NOT EXISTS exercises_search_key_idx ON public.exercises(search_key);

    -- Grant permissions to authenticated users
    GRANT SELECT, INSERT, UPDATE ON public.exercises TO authenticated;
    
    -- Output success message
    RAISE NOTICE 'Successfully updated exercises table constraints';
  ELSE
    RAISE NOTICE 'Exercises table does not exist, skipping constraint update';
  END IF;
END
$$;
