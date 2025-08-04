import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId, userPreferences, category = 'reconnection', difficulty = 'medium' } = await request.json()
    
    // Import Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Generate questions using OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a relationship expert for empty nest couples. Create thoughtful conversation starters that help couples reconnect after their children have left home.`
          },
          {
            role: "user",
            content: `Create 5 conversation starters for empty nester couples in ${userPreferences.city}, ${userPreferences.state}. 

Category: ${category}
Difficulty: ${difficulty}
Interests: ${userPreferences.interests}

Format as JSON:
{
  "questions": [
    {
      "question": "Main question text",
      "followUp": "Optional follow-up question",
      "explanation": "Why this question helps relationships",
      "difficulty": "${difficulty}"
    }
  ],
  "category": "${category}",
  "categoryDescription": "Brief description"
}

Make questions meaningful and designed to bring couples closer together.`
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    })

    const aiData = await aiResponse.json()
    
    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('No response from OpenAI')
    }

    const conversationData = JSON.parse(aiData.choices[0].message.content)

    // Save to database
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('conversation_starters')
      .upsert({
        user_id: userId,
        generated_date: today,
        category: category,
        questions: conversationData.questions,
        difficulty_level: difficulty,
        relationship_stage: 'rediscovering',
        used_questions: []
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      conversations: conversationData,
      saved: data
    })

  } catch (error) {
    console.error('Conversation generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate conversation starters',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category') || 'reconnection'

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('conversation_starters')
      .select('*')
      .eq('user_id', userId)
      .eq('generated_date', today)
      .eq('category', category)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      conversations: data || null
    })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ 
      error: 'Failed to get conversation starters',
      details: error.message 
    }, { status: 500 })
  }
}
