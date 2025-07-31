import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId, scores, notes } = await request.json()
    
    // Import Supabase (can't import at top level in API routes)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const today = new Date().toISOString().split('T')[0]

    // Save check-in
    const { data: checkinData, error: checkinError } = await supabase
      .from('relationship_checkins')
      .upsert({
        user_id: userId,
        checkin_date: today,
        connection_score: scores.connection,
        communication_score: scores.communication,
        intimacy_score: scores.intimacy,
        shared_activities: scores.activities || 0,
        relationship_notes: notes
      })
      .select()
      .single()

    if (checkinError) throw checkinError

    // Check for milestones
    const { data: recentCheckins } = await supabase
      .from('relationship_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('checkin_date', { ascending: false })
      .limit(7)

    const milestones = []

    // Check for 7-day streak
    if (recentCheckins?.length === 7) {
      const dates = recentCheckins.map(c => new Date(c.checkin_date))
      const isConsecutive = dates.every((date, index) => {
        if (index === 0) return true
        const prevDate = dates[index - 1]
        const daysDiff = (prevDate - date) / (1000 * 60 * 60 * 24)
        return daysDiff === 1
      })

      if (isConsecutive) {
        milestones.push({
          user_id: userId,
          milestone_type: 'streak',
          milestone_value: 7,
          achieved_date: today,
          celebration_message: '🔥 Amazing! 7 days of relationship tracking!',
          coins_awarded: 200
        })
      }
    }

    // Check for score improvement
    if (recentCheckins?.length >= 2) {
      const currentAvg = (scores.connection + scores.communication + scores.intimacy) / 3
      const previousAvg = (
        recentCheckins[1].connection_score + 
        recentCheckins[1].communication_score + 
        recentCheckins[1].intimacy_score
      ) / 3

      if (currentAvg >= previousAvg + 2) {
        milestones.push({
          user_id: userId,
          milestone_type: 'score_improvement',
          milestone_value: Math.round(currentAvg),
          achieved_date: today,
          celebration_message: '📈 Your relationship scores are improving!',
          coins_awarded: 150
        })
      }
    }

    // Save milestones
    if (milestones.length > 0) {
      await supabase
        .from('relationship_milestones')
        .insert(milestones)
    }

    return NextResponse.json({
      success: true,
      checkin: checkinData,
      milestones: milestones
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ 
      error: 'Failed to save relationship check-in',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Get recent check-ins
    const { data: checkins, error } = await supabase
      .from('relationship_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('checkin_date', { ascending: false })
      .limit(30)

    if (error) throw error

    // Get recent milestones
    const { data: milestones } = await supabase
      .from('relationship_milestones')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_date', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      checkins: checkins || [],
      milestones: milestones || []
    })

  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json({ 
      error: 'Failed to get relationship progress',
      details: error.message 
    }, { status: 500 })
  }
}
