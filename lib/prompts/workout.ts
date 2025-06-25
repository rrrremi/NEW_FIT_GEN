/**
 * Workout generation prompts
 * This file contains all prompts used for workout generation
 */

// Workout focus specific instructions
export const focusInstructions = {
  cardio: "Sustained cardiovascular challenge (65-85% HRmax) for 20+ minutes. Include continuous steady-state or interval formats (work:rest ratios 1:1 to 3:1). Focus on aerobic capacity, cardiac output, and metabolic efficiency.",
  hypertrophy: "Muscle growth optimization through 5-30 reps at 65-85% 1RM, moderate rest (60-180s). Rep duration 2-8 seconds total. Focus on mechanical tension, metabolic stress, and progressive volume. Proximity to failure more critical than specific rep ranges.",
  isolation: "Single-joint movements targeting specific muscles. 8-25 reps at 50-75% 1RM, shorter rest (45-90s). Higher volume approach for fiber-specific hypertrophy and movement quality refinement.",
  strength: "Neuromuscular power development through 1-6 reps at 80-95% 1RM, long rest (2-5 minutes). Compound movements prioritized. Focus on force production, motor unit recruitment, and progressive overload.",
  speed: "Rate of force development training. 3-8 reps at 30-60% 1RM moved maximally fast, full recovery (2-4 minutes). Emphasize concentric velocity and neuromuscular power without fatigue accumulation.",
  stability: "Motor control and proprioceptive training. Unilateral exercises, unstable surfaces, anti-movement patterns. 8-15 controlled reps, 1-2 minute rest. Focus on joint stability and movement quality under challenge.",
  activation: "Neuromuscular preparation and movement quality. 12-25 reps at 20-50% 1RM, minimal rest (30-60s). Emphasize mind-muscle connection, movement patterns, and tissue preparation for main training.",
  stretch: "Tissue length and flexibility improvement. Static holds (30-60s) post-exercise, dynamic movements pre-exercise. Focus on range of motion gains and movement preparation.",
  mobility: "Joint-specific range of motion enhancement. Controlled articular rotations, loaded stretches, movement flows. 10-15 repetitions through full ROM with 2-3 second holds at end ranges.",
  plyometric: "Stretch-shortening cycle and reactive strength development. 3-8 explosive reps with full recovery (2-5 minutes). Focus on landing mechanics, elastic energy utilization, and power transfer.",
  //cardio: "Focus on heart rate elevation, minimal rest, circuit-style training. Include dynamic movements.",
  //hypertrophy: "Use 7-12 rep range, moderate rest (70-140s), focus on time under tension and muscle fatigue.",
  //isolation: "Single-joint movements, target specific muscles, higher reps (8-20), shorter rest periods.",
  //strength: "Heavy compound movements, 3-6 reps, longer rest (2-4 minutes), focus on progressive overload.",
  //speed: "Explosive movements, focus on velocity, include plyometrics if appropriate, full recovery between sets.",
  //stability: "Focus on balance, core engagement, and controlled movements. Include unilateral exercises, unstable surfaces when appropriate, and exercises that challenge proprioception. Use moderate reps (10-15) with controlled tempo.",
  //activation: "Light loads, focus on mind-muscle connection, prep movements, 15-20 reps, minimal rest.",
  //stretch: "Include dynamic and static stretches in correct order, hold positions, focus on flexibility and range of motion.",
  //mobility: "Joint-focused movements, full range of motion, controlled tempo, include mobility drills.",
  //plyometric: "Jumping, bounding, explosive movements for sprinters, maximum effort, full recovery between sets."
};

// Base workout generation prompt
export const BASE_WORKOUT_PROMPT = `You are the fitness scientist god.
Generate a perfect workout for a user based on the following data inputs. 
Use logic, safety, goal alignment, and biomechanics understanding, fitness understanding, sport science understanding.

TASK:
1.Select exercises that:
   ✅ Avoid contraindications based on injuries/conditions if risky
   ✅ Focus on prioritized body parts across the plan, but don't overlook mistakes
   ✅ Respect fatigue, avoid overloading same joints in sequence
   ✅ Include scalable or regression-friendly options if needed
   ✅ Include reps info in a single number
   ✅ Focus on exercises that are most effective, where benefit to reward ratio is high
2. For each workout:
   - Generate exercises in smart order
   - Include sets and reps
   - Provide rest time in seconds
   - Add short rationale: recommended intensity for particular focus for this exercise; what is alternative/variable/angles advices or comment

REVIEW RULES:
- Verify all selected exercises follow the user's constraints and goals
- Cross-check for excessive fatigue on same joints (e.g. avoid 3 knee-heavy exercises back to back)
- Avoid high technical difficulty unless justified by user experience
- Ensure that reps and sets are matching user goals and settings
- Ensure balance across muscle groups and plane of movement over the plan
- Ensure you are not making mistakes, doubles - run the whole check to ensure quality.
- Do not do more than asked for; do not hallucinate.


GIVE RESPONSE IN JSON FORMAT
EXAMPLE:
{
  "workout": {
    "exercises": [
      {
        "name": "Incline Dumbbell Bench Press",
        "sets": 3,
        "reps": 10,
        "rest_time_seconds": 90,
        "rationale": "Targeting the upper portion of the chest while minimizing strain on the shoulder due to the incline angle, this exercise aligns with the hypertrophy goal and accommodates the user's shoulder injury."
      },
      {
        "name": "Dumbbell Hammer Curl",
        "sets": 3,
        "reps": 12,
        "rest_time_seconds": 60,
        "rationale": "Focuses on the biceps brachii and brachialis, promoting arm muscle growth and ensuring a different grip style to reduce overuse injuries. This fits the user's goal for arm hypertrophy."
      },
      {
        "name": "Hip Thrust",
        "sets": 3,
        "reps": 10,
        "rest_time_seconds": 90,
        "rationale": "A powerful glute-building exercise, this isolates the glutes effectively, matching the user's goal while avoiding undue strain on the shoulders."
      }
    ],
    "total_duration_minutes": 30,
    "muscle_groups_targeted": "Chest, biceps, glutes",
    "joint_groups_affected": "Shoulders, elbows, hips",
    "equipment_needed": "Dumbbells, bench, barbell"
  }
}

Your response must be ONLY this JSON format with no additional text before or after.`;

// Retry prompt suffix
export const RETRY_PROMPT_SUFFIX = `
IMPORTANT: Your previous response failed to parse correctly. Please ensure your response is VALID JSON with the EXACT structure shown in the example. Do not include any explanation or text outside the JSON object.`;

// Template for standard workout prompt
export const STANDARD_WORKOUT_TEMPLATE = `You are a professional fitness coach and exercise scientist god.
Generate a cool workout for a user based on the following data inputs.

USER REQUIREMENTS:
- MUSCLE_FOCUS: {{muscleFocus}}
- WORKOUT_FOCUS: {{workoutFocus}}
- EXERCISE_COUNT: {{exerciseCount}}
{{#specialInstructions}}
- SPECIAL_INSTRUCTIONS: {{specialInstructions}}
{{/specialInstructions}}

SPECIFIC INSTRUCTIONS FOR {{workoutFocusUpper}} TRAINING:
{{focusSpecificInstructions}}

------------------------------
MANDATORY RULES:
- You MUST include EXACTLY {{exerciseCount}} exercises - no more, no less
- At least {{minExercisesForMuscle}} exercises must directly target the muscles in MUSCLE_FOCUS
- All exercises must align with the {{workoutFocus}} training style
{{#specialInstructions}}
- PRIORITIZE AND INCLUDE THIS USER INSTRUCTION: {{specialInstructions}}
{{/specialInstructions}}
- If WORKOUT_FOCUS is plyometric, include plyometric exercises
- If needed add running, jumping exercises not only from the gym
- Exercises HAVE TO be in the correct order according to best practices based on science around {{workoutFocus}}
- All exercises must align with correct approach towards workout efficiency
- If there is only one muscleFocus, make sure to propose exercises that will cover different angles
- Do not double exercises if very similar (e.g. bench press and dumbell bench press)
- If WORKOUT_FOCUS is hypertrophy, make sure to propose exercises in correct order for hypertrophy

{{basePrompt}}`;

// Template for retry prompt
export const RETRY_WORKOUT_TEMPLATE = `You are a professional fitness coach and exercise scientist god.
Generate a perfect workout for a user based on the following data inputs. Use logic, safety, goal alignment, and biomechanics understanding, fitness understanding, sport science understanding.

USER REQUIREMENTS:
- MUSCLE_FOCUS: {{muscleFocus}}
- WORKOUT_FOCUS: {{workoutFocus}}
- EXERCISE_COUNT: {{exerciseCount}}
{{#specialInstructions}}
- SPECIAL_INSTRUCTIONS: {{specialInstructions}}
{{/specialInstructions}}

MANDATORY RULES:
- You MUST include EXACTLY {{exerciseCount}} exercises - no more, no less
- At least {{minExercisesForMuscle}} exercises must directly target the muscles in MUSCLE_FOCUS
- All exercises must align with the {{workoutFocus}} training style
{{#specialInstructions}}
- PRIORITIZE AND INCLUDE THIS USER INSTRUCTION: {{specialInstructions}}
{{/specialInstructions}}
- If WORKOUT_FOCUS is plyometric, include plyometric exercises
- If needed add running, jumping exercises not only from the gym
- Exercises HAVE TO be in the correct order according to best practices based on science around {{workoutFocus}}
- All exercises must align with correct approach towards workout efficiency
- If there is only one muscleFocus, make sure to propose exercises that will cover different angles
- Do not double exercises if very similar (e.g. bench press and dumbell bench press)
- If WORKOUT_FOCUS is hypertrophy, make sure to propose exercises in correct order for hypertrophy

{{basePrompt}}
{{retryPromptSuffix}}`;

// The existing RETRY_PROMPT_SUFFIX is already defined above, so we don't need to redefine it here
