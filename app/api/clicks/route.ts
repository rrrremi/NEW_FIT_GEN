import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Insert click record
    const { error } = await supabase
      .from('clicks')
      .insert({ user_id: user.id, click_count: 1 })
    
    if (error) {
      console.error('Error saving click:', error)
      return NextResponse.json(
        { error: 'Failed to save click' },
        { status: 500 }
      )
    }
    
    // Get updated total
    const { data, error: countError } = await supabase
      .from('clicks')
      .select('click_count')
      .eq('user_id', user.id)
    
    if (countError) {
      console.error('Error fetching click count:', countError)
      return NextResponse.json(
        { error: 'Failed to fetch updated count' },
        { status: 500 }
      )
    }
    
    const totalClicks = data?.reduce((sum, item) => sum + item.click_count, 0) || 0
    
    return NextResponse.json({ totalClicks })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's total clicks
    const { data, error } = await supabase
      .from('clicks')
      .select('click_count')
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error fetching click count:', error)
      return NextResponse.json(
        { error: 'Failed to fetch click count' },
        { status: 500 }
      )
    }
    
    const totalClicks = data?.reduce((sum, item) => sum + item.click_count, 0) || 0
    
    return NextResponse.json({ totalClicks })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
