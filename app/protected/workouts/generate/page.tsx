'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '@/components/auth/SignOutButton';
import { WorkoutGenerationResponse, WorkoutGenerationRequest } from '@/types/workout';
import { createClient } from '@/lib/supabase/client';
import MuscleGroupPopup from '@/components/MuscleGroupPopup';
import { muscleGroups, mapToSimplifiedCategories } from '@/lib/data/muscleGroups';

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
  { id: 'cardio', label: 'Cardio' },
  { id: 'hypertrophy', label: 'Hypertrophy (muscle growth)' },
  { id: 'isolation', label: 'Isolation (single muscle)' },
  { id: 'strength', label: 'Strength (heavy, low reps)' },
  { id: 'speed', label: 'Speed (explosive movements)' },
  { id: 'stability', label: 'Stability (balance/control)' },
  { id: 'activation', label: 'Activation (warm-up focused)' },
  { id: 'stretch', label: 'Stretch (flexibility)' },
  { id: 'mobility', label: 'Mobility (range of motion)' },
  { id: 'plyometric', label: 'Plyometric (jumping/explosive)' },
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
  const [workoutFocus, setWorkoutFocus] = useState<string>('hypertrophy');
  const [exerciseCount, setExerciseCount] = useState<number>(4);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [activePopupGroup, setActivePopupGroup] = useState<string | null>(null);
  const [selectedDetailedMuscles, setSelectedDetailedMuscles] = useState<Set<string>>(new Set());
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  // No limit on muscle selections

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
    
    if (!workoutFocus) {
      return 'Please select a workout focus';
    }
    
    if (exerciseCount < 1 || exerciseCount > 10) {
      return 'Exercise count must be between 1-10';
    }
    
    if (specialInstructions && specialInstructions.length > 140) {
      return 'Special instructions must be 140 characters or less';
    }
    
    return null;
  };

  // Store the original button ID for highlighting specific subgroups
  const [activePopupHighlight, setActivePopupHighlight] = useState<string | null>(null);

  // Handle mouse/touch down on muscle group button
  const handleMuscleGroupMouseDown = (id: string) => {
    // Start a timer for long press
    longPressTimerRef.current = setTimeout(() => {
      // Long press detected, open popup
      setActivePopupGroup(id);
      setActivePopupHighlight(null); // No need to highlight since each button has its own popup
    }, 500); // 500ms for long press
  };

  // Handle mouse/touch up on muscle group button
  const handleMuscleGroupMouseUp = (id: string) => {
    // Clear the timer if mouse up happens before long press threshold
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Handle click on muscle group button (for regular selection)
  const toggleMuscleGroup = (id: string) => {
    // Only toggle if not a long press (which would be handled by popup)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    setMuscleFocus(prev => {
      // If already selected, remove it
      if (prev.includes(id)) {
        // Use filter only when we need to remove an item
        return prev.filter(m => m !== id);
      } else {
        // Limit to 4 selections
        if (prev.length >= 4) {
          // Return the same array reference if we're not changing anything
          return prev;
        }
        // Only create a new array when adding an item
        return [...prev, id];
      }
    });
    
    // Clear any existing error when user interacts with the form
    if (error) setError(null);
  };
  
  // Handle selection of individual muscles from the popup
  const handleSelectMuscle = (muscleId: string, selected: boolean) => {
    setSelectedDetailedMuscles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(muscleId);
      } else {
        newSet.delete(muscleId);
      }
      return newSet;
    });
  };

  const generateWorkout = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    try {
      // Prepare special instructions with detailed muscle selection if any
      let enhancedInstructions = specialInstructions;
      
      if (selectedDetailedMuscles.size > 0) {
        // Map the detailed muscle selections to the simplified categories for API compatibility
        const simplifiedCategories = mapToSimplifiedCategories(Array.from(selectedDetailedMuscles));
        
        // Add detailed muscle information to special instructions
        const detailedMuscleInfo = Array.from(selectedDetailedMuscles).map(id => {
          // Find the muscle name by ID
          for (const groupId in muscleGroups) {
            const group = muscleGroups[groupId];
            for (const subGroupId in group.subGroups) {
              const subGroup = group.subGroups[subGroupId];
              const muscle = subGroup.muscles.find(m => m.id === id);
              if (muscle) {
                return muscle.name;
              }
            }
          }
          return id; // Fallback to ID if name not found
        }).join(', ');
        
        enhancedInstructions = `${enhancedInstructions ? enhancedInstructions + '. ' : ''}Focus on these specific muscles: ${detailedMuscleInfo}.`;
        
        // If no muscle groups are selected but detailed muscles are, use the simplified categories
        if (muscleFocus.length === 0 && simplifiedCategories.length > 0) {
          setMuscleFocus(simplifiedCategories);
        }
      }
      
      const requestBody: WorkoutGenerationRequest = {
        muscle_focus: muscleFocus,
        workout_focus: workoutFocus,
        exercise_count: exerciseCount,
        special_instructions: enhancedInstructions
      };
      
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
            requestBody
          });
          throw new Error(data.error || 'Failed to generate workout');
        }
      } catch (fetchError) {
        console.error('Fetch error during workout generation:', fetchError);
        throw fetchError;
      }

      if (data && data.success && data.workoutId) {
        // Update the generation count
        setGenerationsToday(prev => prev !== null ? prev + 1 : 1);
        
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
    }
  };

  // Show loading indicator while initial data is being fetched
  if (!isLoaded) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-2xl p-4 shadow-md flex items-center justify-center">
          <div className="text-center py-6">
            <svg className="animate-spin h-6 w-6 text-black mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl p-0 shadow-md overflow-hidden">
        {/* Simplified Header */}
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">AI Workout Generator</h1>
          </div>
          {isLoaded && generationsToday !== null && (
            <div className="flex items-center text-xs">
              <span>{generationsToday}/100</span>
              <div className="w-16 bg-gray-700 rounded-full h-1.5 mx-2">
                <div 
                  className="bg-white h-1.5 rounded-full" 
                  style={{ width: `${Math.min((generationsToday || 0) / 100 * 100, 100)}%` }}
                  aria-hidden="true"
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white">

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-2 rounded mb-3 text-sm">
              <span>{error}</span>
            </div>
          )}

          {/* Muscle group selection */}
          <div className="mb-4">
            <h2 className="text-sm font-medium mb-2">1. Muscle Groups <span className="text-xs text-gray-500">(1-4)</span></h2>
            <div className="flex flex-wrap gap-1">
              {MUSCLE_GROUPS.map((muscle) => (
                <button 
                  key={muscle.id}
                  onClick={() => toggleMuscleGroup(muscle.id)}
                  onMouseDown={() => handleMuscleGroupMouseDown(muscle.id)}
                  onMouseUp={() => handleMuscleGroupMouseUp(muscle.id)}
                  onMouseLeave={() => handleMuscleGroupMouseUp(muscle.id)}
                  onTouchStart={() => handleMuscleGroupMouseDown(muscle.id)}
                  onTouchEnd={() => handleMuscleGroupMouseUp(muscle.id)}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${muscleFocus.includes(muscle.id) 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  role="checkbox"
                  aria-checked={muscleFocus.includes(muscle.id)}
                  aria-label={`Select ${muscle.label} muscle group. Tap and hold for detailed selection.`}
                >
                  {muscle.label}
                  {/* Show indicator if detailed muscles are selected */}
                  {Array.from(selectedDetailedMuscles).some(id => id.startsWith(muscle.id + '-')) && (
                    <span className="ml-1 text-xs">•</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-medium mb-2">2. Workout Focus</h2>
            <div className="flex flex-wrap gap-1">
              {WORKOUT_FOCUS.map((focus) => (
                <button 
                  key={focus.id}
                  onClick={() => setWorkoutFocus(focus.id)}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${workoutFocus === focus.id 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  role="radio"
                  aria-checked={workoutFocus === focus.id}
                  aria-label={`Select ${focus.label} workout focus`}
                >
                  {focus.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-sm font-medium mb-2">3. Number of Exercises:</h2>
            <div className="slidecontainer w-full">
              <style jsx>{`
                .custom-slider {
                  -webkit-appearance: none;
                  width: 100%;
                  height: 10px;
                  border-radius: 5px;
                  background: #d3d3d3;
                  outline: none;
                  opacity: 0.7;
                  -webkit-transition: .2s;
                  transition: opacity .2s;
                }

                .custom-slider:hover {
                  opacity: 1;
                }

                .custom-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: black;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 0 2px rgba(0,0,0,0.3);
                }

                .custom-slider::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: black;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 0 2px rgba(0,0,0,0.3);
                }
              `}</style>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={exerciseCount}
                onChange={(e) => {
                  setExerciseCount(parseInt(e.target.value));
                  if (error) setError(null);
                }}
                className="custom-slider"
                aria-label="Select number of exercises"
              />
              <div className="flex justify-end mt-2">
                <div className="text-sm font-bold">
                  Value: <span>{exerciseCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions field */}
          <div className="mb-4">
            <h2 className="text-sm font-medium mb-2">4. Special Instructions <span className="text-xs text-gray-500">(Optional)</span></h2>
            <div>
              <textarea
                value={specialInstructions}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSpecialInstructions(newValue);
                  setCharCount(newValue.length);
                  if (error) setError(null);
                }}
                placeholder="e.g., 'no jumping', 'bad knees'"
                className="w-full p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent resize-none"
                rows={2}
                maxLength={140}
                aria-label="Special instructions for workout generation"
              />
              <div className="flex justify-end mt-1 text-xs text-gray-500">
                <span className={charCount > 120 ? 'text-red-500' : ''}>{charCount}/140</span>
              </div>
            </div>
          </div>

          {/* Generate button with simplified styling */}
          <div className="mt-4">
            {(() => {
              const isDisabled = isGenerating || 
                muscleFocus.length < 1 || 
                muscleFocus.length > 4 || 
                !workoutFocus || 
                (generationsToday !== null && generationsToday >= 100);
                
              return (
                <button
                  onClick={generateWorkout}
                  disabled={isDisabled}
                  className={`w-full py-2 rounded text-sm font-medium transition-all ${isDisabled 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800'}`}
                  aria-busy={isGenerating ? "true" : "false"}
                  aria-label="Generate workout with selected options"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Generate Workout'}
                </button>
              );
            })()}
          </div>
          
          {/* Simplified footer */}
          <div className="mt-4 pt-2 border-t border-gray-100 text-center">
            <Link 
              href="/protected/workouts" 
              className="text-xs text-gray-600 hover:text-black"
            >
              View workout history
            </Link>
          </div>
          
          {/* Muscle Group Popup */}
          {activePopupGroup && (
            <MuscleGroupPopup
              groupId={activePopupGroup}
              groupLabel={MUSCLE_GROUPS.find(m => m.id === activePopupGroup)?.label || ''}
              isOpen={!!activePopupGroup}
              onClose={() => {
                setActivePopupGroup(null);
                setActivePopupHighlight(null);
              }}
              onSelectMuscle={handleSelectMuscle}
              selectedMuscles={selectedDetailedMuscles}
              maxSelections={Infinity}
              totalSelected={selectedDetailedMuscles.size}
              highlightSubgroup={activePopupHighlight || undefined}
            />
          )}
        </div>
      </div>
    </main>
  )
}
