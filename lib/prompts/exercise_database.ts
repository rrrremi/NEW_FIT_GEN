/**
 * Exercise database prompts
 * This file contains prompts specifically for the exercise database feature
 */

// Enhanced workout generation prompt with exercise database requirements
export const EXERCISE_DATABASE_PROMPT = `You are a fitness and sport, science god.
Generate a perfect workout.
Exercise Selection Criteria:
  Target {{muscleFocus}} with joint fatigue management
  Include, target specified muscle subgroups ({{subgroupFocus}})
  High benefit-to-risk ratio, science-based selections
  Scalable/regression-friendly options included
  Select not only gym workout exercises, but also plyometric exercises, running intervals, mobility exercises. 
Exercise Specifications:
  //*Format: "Equipment Exercise Name" (Equipment: Barbell, Dumbbell, Cable, Machine, Kettlebell, Resistance Band, EZ Bar, Bodyweight)
Required Details:
  Sets/reps ({{workoutFocus}}-aligned according to science)
  Rest time (seconds according to fatigue management)
  Primary and secondary muscles
  Movement type (compound/isolation)
  Rationale (how to?, benefits, risks)
Mandatory Requirements:
  Exactly {{exerciseCount}} exercises
  Minimum {{minExercisesForMuscle}} targeting {{muscleFocus}}
  {{workoutFocus}} training style alignment
  {{#specialInstructions}}Priority: {{specialInstructions}}{{/specialInstructions}}
  Correct exercise order per {{workoutFocus}} science
  Multiple angles for single muscle focus
  No duplicate similar exercises
  Include non-gym movements for plyometric focus
Quality Assurance:
  Verify constraint compliance and goal alignment
  Prevent excessive joint/pattern fatigue
  Match technical difficulty to experience
  Balance muscle groups and movement planes
  Confirm naming consistency
  Optimize {{workoutFocus}}-specific sequencing
  /*
  TASK:
  1. Select exercises that:
     - Focus on prioritized body parts across the plan
     - Respect fatigue, avoid overloading same joints in sequence
     - Include scalable or regression-friendly options if needed
     - Only high benefit to reward ratio exercises
     - Only smart, modern science approach
  2. For each exercise:
     - Use CONSISTENT NAMING CONVENTION: "Equipment Exercise Name" (e.g., "Barbell Bench Press", "Dumbbell Lateral Raise")
     - Equipment terms that MUST be used: Barbell, Dumbbell, Cable, Machine, Kettlebell, Resistance Band, EZ Bar, Bodyweight, Trap bar,Bar, Box
     - Include sets and reps according to the focus of the workout
     - Provide rest time in seconds
     - List primary and secondary muscles targeted
     - Rationale - how to do this exercise; what are benefits and risks
     - Specify movement type (compound or isolation)
  
  REVIEW RULES:
  - Verify all selected exercises follow the user's constraints and goals
  - Cross-check for excessive fatigue on same joints
  - Avoid high technical difficulty unless justified by user experience
  - Ensure that reps and sets match user goals and settings
  - Ensure balance across muscle groups and plane of movement
  - Double-check exercise naming consistency
*/

give response in json:
{
  "workout": {
    "exercises": [
      {
        "name": "Barbell Bench Press",
        "sets": 3,
        "reps": 10,
        "rest_time_seconds": 90,
        "primary_muscles": ["chest", "triceps"],
        "secondary_muscles": ["shoulders"],
        "equipment": "barbell",
        "movement_type": "compound",
        "order_index": 1,
        "rationale": "Targets the chest with heavy load for maximum hypertrophy stimulus."
      },
      {
        "name": "Dumbbell Lateral Raise",
        "sets": 3,
        "reps": 12,
        "rest_time_seconds": 60,
        "primary_muscles": ["shoulders"],
        "secondary_muscles": ["traps"],
        "equipment": "dumbbell",
        "movement_type": "isolation",
        "order_index": 2,
        "rationale": "Isolates the lateral deltoids for balanced shoulder development."
      }
    ],
    "total_duration_minutes": 30,
    "muscle_groups_targeted": "Chest, shoulders, triceps",
    "joint_groups_affected": "Shoulders, elbows",
    "equipment_needed": "Barbell, dumbbells"
  }
}

Response to be ONLY this JSON; nothing else`;

// Retry prompt suffix with emphasis on exercise format
export const EXERCISE_DATABASE_RETRY_PROMPT = `
IMPORTANT: Your previous response failed to parse correctly or did not follow the required exercise format. 

Please ensure:
1. Your response is VALID JSON with the EXACT structure shown in the example
2. Exercise names follow the "Equipment Exercise Name" format (e.g., "Barbell Bench Press")
3. Each exercise includes primary_muscles, secondary_muscles, equipment, and movement_type
4. Equipment terms are standardized (Barbell, Dumbbell, Cable, Machine, Kettlebell, Resistance Band, EZ Bar, or Bodyweight)
5. Do not include any explanation or text outside the JSON object`;
