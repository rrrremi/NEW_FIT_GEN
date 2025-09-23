'use client'

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SignOutButton from '@/components/auth/SignOutButton';
import { WorkoutGenerationResponse, WorkoutGenerationRequest } from '@/types/workout';
import { createClient } from '@/lib/supabase/client';
import { muscleGroups, mapToSimplifiedCategories } from '@/lib/data/muscleGroups';
import { motion } from 'framer-motion'
import { Dumbbell, Sparkles, Play, Settings, ChevronLeft, Zap, Target, Clock, BarChart3, CheckCircle, Activity } from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip';
import { getRandomTooltip } from '@/lib/tooltips/workoutFocusTooltips';

// Dynamically import the ProgressiveWorkoutGeneration component
const ProgressiveWorkoutGeneration = dynamic(
  () => import('@/components/ui/ProgressiveWorkoutGeneration'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-fuchsia-400/30 border-t-fuchsia-400 animate-spin"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading...</h3>
          </div>
        </div>
      </div>
    )
  }
);

// Muscle groups and workout focus options
const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'forearms', label: 'Forearms' },
  { id: 'neck', label: 'Neck' },
  { id: 'core', label: 'Core' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'quads', label: 'Quads' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'calves', label: 'Calves' },
];

const WORKOUT_FOCUS = [
  { id: 'hypertrophy', label: 'Hypertrophy', icon: Dumbbell, description: 'Build muscle size and strength' },
  { id: 'strength', label: 'Strength', icon: Zap, description: 'Maximize muscle power and force' },
  { id: 'cardio', label: 'Cardio', icon: Activity, description: 'Cardiovascular endurance' },
  { id: 'isolation', label: 'Isolation', icon: Target, description: 'Target specific muscle groups' },
  { id: 'stability', label: 'Stability', icon: Target, description: 'Balance and control focus' },
  { id: 'plyometric', label: 'Plyometric', icon: Zap, description: 'Explosive movements' },
  { id: 'isometric', label: 'Isometric', icon: Target, description: 'Static holds that build strength without movement' },
];

export default function GenerateWorkoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [generationsToday, setGenerationsToday] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [muscleFocus, setMuscleFocus] = useState<string[]>([]);
  const [workoutFocus, setWorkoutFocus] = useState<string[]>(['hypertrophy']);
  const [exerciseCount, setExerciseCount] = useState<number>(4);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [showProgressiveLoading, setShowProgressiveLoading] = useState(false)
  const [progressiveStep, setProgressiveStep] = useState(0)
  const [progressiveSteps] = useState([
    'Validating your inputs',
    'Preparing AI prompt',
    'Generating with OpenAI',
    'Processing workout data',
    'Saving to database',
    'Finalizing your workout'
  ])

  // Check admin status and generation count on load
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Check admin status
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

          setIsAdmin(!!profileData?.is_admin)

          // Check generation count for today
          const now = new Date()
          const dayStart = new Date(now)
          dayStart.setHours(now.getHours() - 24)

          const { count } = await supabase
            .from('workouts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', dayStart.toISOString())

          setGenerationsToday(count || 0)
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadInitialData()
  }, [supabase])

  // Validate inputs before submission
  const validateInputs = (): string | null => {
    if (muscleFocus.length < 1 || muscleFocus.length > 4) {
      return 'Please select 1-4 muscle groups';
    }

    if (workoutFocus.length < 1 || workoutFocus.length > 3) {
      return 'Please select 1-3 workout focus types';
    }

    if (exerciseCount < 1 || exerciseCount > 10) {
      return 'Exercise count must be between 1-10';
    }

    if (specialInstructions && specialInstructions.length > 140) {
      return 'Special instructions must be 140 characters or less';
    }

    return null;
  };

  // Handle click on muscle group button (for regular selection)
  const toggleMuscleGroup = (id: string) => {
    setMuscleFocus(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id) 
        : prev.length < 4 ? [...prev, id] : prev
    );

    // Clear any existing error when user interacts with the form
    if (error) setError(null);
  };
  
  // Handle workout focus selection (multiple, up to 3)
  const toggleWorkoutFocus = (id: string) => {
    setWorkoutFocus(prev => 
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(f => f !== id) : prev
        : prev.length < 3 ? [...prev, id] : prev
    );

    // Clear any existing error when user interacts with the form
    if (error) setError(null);
  };

  const generateWorkout = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowProgressiveLoading(true);
    setProgressiveStep(0);

    try {
      // Step 1: Validating inputs
      setProgressiveStep(0);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX

      // Step 2: Preparing AI prompt
      setProgressiveStep(1);
      await new Promise(resolve => setTimeout(resolve, 300));

      const requestBody: WorkoutGenerationRequest = {
        muscle_focus: muscleFocus,
        workout_focus: workoutFocus,
        exercise_count: exerciseCount,
        special_instructions: specialInstructions
      };

      // Step 3: Generating with OpenAI
      setProgressiveStep(2);

      let data;
      try {
        const response = await fetch('/api/workouts/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        data = await response.json();

        if (!response.ok) {
          console.error('Workout generation failed:', {
            status: response.status,
            statusText: response.statusText,
            error: data.error,
            errorType: data.errorType,
            requestBody
          });
          
          // Handle rate limit errors specifically
          if (response.status === 429 || data.errorType === 'rate_limit') {
            throw new Error('API usage limit reached. Please try again later.');
          }
          
          throw new Error(data.error || 'Failed to generate workout');
        }
      } catch (fetchError) {
        console.error('Fetch error during workout generation:', fetchError);
        throw fetchError;
      }

      // Step 4: Processing workout data
      setProgressiveStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Saving to database
      setProgressiveStep(4);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 6: Finalizing workout
      setProgressiveStep(5);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (data && data.success && data.workoutId) {
        // Update the generation count
        setGenerationsToday(prev => prev !== null ? prev + 1 : 1);

        // Hide progressive loading
        setShowProgressiveLoading(false);

        // Redirect to the workout details page
        router.push(`/protected/workouts/${data.workoutId}`);
      } else if (data) {
        throw new Error(data.error || 'Failed to generate workout');
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsGenerating(false);
      setShowProgressiveLoading(false);
    }
  };

  // Show loading indicator while initial data is being fetched
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-fuchsia-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Progressive loading overlay
  const loadingOverlay = showProgressiveLoading && (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-16 h-16 mx-auto rounded-full border-4 border-fuchsia-400/30 border-t-fuchsia-400 animate-spin"></div>
      </div>
    }>
      <ProgressiveWorkoutGeneration
        isVisible={showProgressiveLoading}
        currentStep={progressiveStep}
        steps={progressiveSteps}
      />
    </Suspense>
  );

  return (
    <>
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <Link href="/protected/workouts">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-xl hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Workouts
          </button>
        </Link>
      </div>

      {/* Main Content - Minimalistic Form */}
      <div className="mx-auto max-w-xl px-4 py-6 overflow-visible">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-400" />
            Generate Workout
          </h1>
        </div>

        {/* Minimalistic Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
        >
          {/* Form Content */}
          <div className="p-4">
            {/* Error Message */}
            {error && (
              <div className={`mb-3 p-3 rounded-lg ${error.includes('rate limit') || error.includes('quota') || error.includes('429') ? 'bg-amber-500/20 text-amber-200' : 'bg-red-500/20 text-red-200'} text-xs`}>
                {error.includes('rate limit') || error.includes('quota') || error.includes('429') ? (
                  <>
                    <h4 className="font-medium mb-1">API Usage Limit Reached</h4>
                    <p>We've reached our daily limit for workout generation.</p>
                    <p className="mt-1">Please try again later or contact support if this persists.</p>
                  </>
                ) : (
                  error
                )}
              </div>
            )}

            {/* Muscle Groups - Horizontal Chips */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-1.5">Target Muscles</label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => toggleMuscleGroup(group.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      muscleFocus.includes(group.id)
                        ? 'bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-500/50'
                        : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20'
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Focus - Multiple Selection (up to 3) */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-white/80">Workout Focus</label>
                <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  {workoutFocus.length}/3 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {WORKOUT_FOCUS.map((focus) => (
                  <Tooltip 
                    key={focus.id}
                    content={getRandomTooltip(focus.id) || focus.description}
                    position="top"
                  >
                    <button
                      onClick={() => toggleWorkoutFocus(focus.id)}
                      className={`flex flex-row items-center justify-center px-3 py-1.5 rounded-lg transition-colors ${
                        workoutFocus.includes(focus.id)
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                          : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20'
                      }`}
                      aria-pressed={workoutFocus.includes(focus.id)}
                    >
                      <focus.icon className={`h-4 w-4 mr-1.5 ${workoutFocus.includes(focus.id) ? 'text-cyan-300' : 'text-white/60'}`} />
                      <span className="text-xs font-medium">{focus.label}</span>
                    </button>
                  </Tooltip>
                ))}
              </div>
              
              {/* Selected Focus Summary */}
              {workoutFocus.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {workoutFocus.map(focusId => {
                    const focus = WORKOUT_FOCUS.find(f => f.id === focusId);
                    return focus ? (
                      <span 
                        key={focusId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-xs text-cyan-300 justify-center"
                      >
                        {focus.label}
                        <button
                          onClick={() => toggleWorkoutFocus(focusId)}
                          className={`ml-1 ${workoutFocus.length > 1 ? 'hover:text-cyan-200' : 'opacity-40 cursor-not-allowed'}`}
                          disabled={workoutFocus.length <= 1}
                          title={workoutFocus.length <= 1 ? 'At least one focus is required' : 'Remove focus'}
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Exercise Count - Simple Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-white/80">Exercises</label>
                <span className="text-sm font-medium text-fuchsia-300">{exerciseCount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={exerciseCount}
                onChange={(e) => setExerciseCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Special Instructions - Minimal Input */}
            <div className="mb-4">
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => {
                  setSpecialInstructions(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder="Optional: Special instructions..."
                className="w-full p-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-fuchsia-400/50 focus:outline-none text-sm"
                maxLength={140}
              />
              {charCount > 0 && (
                <div className="text-right mt-1 text-xs text-white/50">
                  {charCount}/140
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              disabled={isGenerating || muscleFocus.length === 0}
              onClick={generateWorkout}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
                isGenerating || muscleFocus.length === 0
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white hover:opacity-90'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Generate Workout
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Usage Stats */}
        <div className="mt-4 text-center text-xs text-white/50">
          Today's generations: {generationsToday !== null ? `${generationsToday}/100` : '...'}
        </div>
      </div>

      {/* Progressive Loading Overlay */}
      {loadingOverlay}
    </>
  );
}
