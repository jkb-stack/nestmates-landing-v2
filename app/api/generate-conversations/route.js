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

    // Determine relationship stage based on user data
    const relationshipStage = determineRelationshipStage(userPreferences)

    // Create AI prompt based on category and user preferences
    const categoryPrompts = {
      dreams: "Focus on hopes, aspirations, and dreams they had before kids or want to pursue now",
      intimacy: "Gentle questions about emotional and physical connection, appropriate for long-term relationships",
      memories: "Questions about their past, early relationship, and favorite memories together",
      future: "Questions about their future plans, travel, retirement, and goals as a couple",
      fun: "Light-hearted, playful questions that bring laughter and joy",
      reconnection: "Questions specifically designed to help empty nesters rediscover each other"
    }

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
            content: `You are a relationship expert specializing in empty nest couples who want to reconnect after their children have left home. Create thoughtful conversation starters that help couples rediscover each other, build intimacy, and strengthen their bond.

Guidelines:
- Questions should be appropriate for couples in their 50s-60s
- Focus on rebuilding connection after the parenting phase
- Avoid overly personal or potentially conflict-inducing topics
- Questions should encourage sharing, vulnerability, and emotional connection
- Consider their life stage: freedom from daily parenting, more time together, identity shifts`
          },
          {
            role: "user",
            content: `Create 5 conversation starters for empty nester couples. 

User context:
- Location: ${userPreferences.city}, ${userPreferences.state}
- Interests: ${userPreferences.interests}
- Budget preference: ${userPreferences.budget}
- Relationship stage: ${relationshipStage}

Category: ${category} - ${categoryPrompts[category]}
Difficulty level: ${difficulty}

Format as JSON:
{
  "questions": [
    {
      "question": "Main question text",
      "followUp": "Optional follow-up question or prompt",
      "explanation": "Why this question helps relationships (1 sentence)",
      "difficulty": "${difficulty}"
    }
  ],
  "category": "${category}",
  "categoryDescription": "Brief description of this question category"
}

Make questions thoughtful, specific, and designed to create meaningful conversations that bring couples closer together.`
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    })

    const aiData = await aiResponse.json()
    
    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('No response from AI')
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
        relationship_stage: relationshipStage,
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

    // Get today's conversation starters
    const { data, error } = await supabase
      .from('conversation_starters')
      .select('*')
      .eq('user_id', userId)
      .eq('generated_date', today)
      .eq('category', category)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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

// Helper function to determine relationship stage
function determineRelationshipStage(userPreferences) {
  // This could be enhanced with more user data over time
  // For now, we'll use some basic logic
  return 'rediscovering' // Default for empty nesters
}

// Mark question as used
export async function PATCH(request) {
  try {
    const { conversationId, questionIndex } = await request.json()

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Get current conversation
    const { data: current, error: fetchError } = await supabase
      .from('conversation_starters')
      .select('used_questions')
      .eq('id', conversationId)
      .single()

    if (fetchError) throw fetchError

    // Add question index to used questions
    const usedQuestions = current.used_questions || []
    if (!usedQuestions.includes(questionIndex)) {
      usedQuestions.push(questionIndex)
    }

    // Update database
    const { error: updateError } = await supabase
      .from('conversation_starters')
      .update({ used_questions: usedQuestions })
      .eq('id', conversationId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Mark question used error:', error)
    return NextResponse.json({ 
      error: 'Failed to mark question as used',
      details: error.message 
    }, { status: 500 })
  }
}
