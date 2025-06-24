import { createClient } from '../supabase/server'
import { getUser } from './auth'

/**
 * Get the total click count for the current user
 * @returns The total click count or 0 if not found
 */
export async function getUserClickCount(): Promise<number> {
  const user = await getUser()
  
  if (!user) {
    return 0
  }
  
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clicks')
    .select('click_count')
    .eq('user_id', user.id)
  
  if (error || !data) {
    console.error('Error fetching click count:', error)
    return 0
  }
  
  return data.reduce((sum, item) => sum + item.click_count, 0)
}

/**
 * Get all users with their click counts
 * @returns Array of users with their click counts
 */
export async function getAllUsersWithClickCounts() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_statistics')
    .select('*')
    .order('email')
  
  if (error) {
    console.error('Error fetching users with click counts:', error)
    return []
  }
  
  return data
}

/**
 * Increment the click count for the current user
 * @returns The new total click count or null if failed
 */
export async function incrementClickCount(): Promise<number | null> {
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  const supabase = createClient()
  
  // Insert new click record
  const { error } = await supabase
    .from('clicks')
    .insert({ user_id: user.id, click_count: 1 })
  
  if (error) {
    console.error('Error incrementing click count:', error)
    return null
  }
  
  // Get updated total
  return await getUserClickCount()
}
