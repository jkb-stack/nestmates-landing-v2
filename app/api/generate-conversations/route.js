import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('=== Conversation API Debug ===')
    
    // Step 1: Parse request
    const body = await request.json()
    console.log('1. Request body:', body)
    
    const { userId, userPreferences, category = 'reconnection', difficulty = 'medium' } = body
    console.log('2. Parsed data:', { userId, userPreferences, category, difficulty })

    // Step 2: Check environment variables
    console.log('3. Environment check:')
    console.log('   OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('   SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('   SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing')
    }

    // Step 3: Try OpenAI API call
    console.log('4. Calling OpenAI API...')
    
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
            content: "You are a relationship expert. Create conversation starters for couples."
          },
          {
            role: "user",
            content: `Create 3 simple conversation questions for couples about ${category}. Return valid JSON in this exact format:
{
  "questions": [
    {
      "question": "What's your favorite memory from this year?",
      "followUp": "What made that moment special?",
      "explanation": "Sharing positive memories strengthens emotional bonds.",
      "difficulty": "${difficulty}"
    }
  ],
  "category": "${category}",
  "categoryDescription": "Questions about ${category}"
}`
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    })

    console.log('5. OpenAI Response status:', aiResponse.status)
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.log('   OpenAI Error:', errorText)
      throw new Error(`OpenAI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    console.log('6. OpenAI Response data:', aiData)

    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('No choices in OpenAI response')
    }

    // Step 4: Parse AI response
    let conversationData
    try {
      conversationData = JSON.parse(aiData.choices[0].message.content)
      console.log('7. Parsed conversation data:', conversationData)
    } catch (parseError) {
      console.log('   JSON Parse Error:', parseError)
      console.log('   Raw content:', aiData.choices[0].message.content)
      throw new Error('Failed to parse AI response as JSON')
    }

    // Step 5: Try database save
    console.log('8. Attempting database save...')
    
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const today = new Date().toISOString().split('T')[0]
      console.log('   Today:', today)
      console.log('   User ID:', userId)

      const { data, error } = await supabase
        .from('conversation_starters')
        .upsert({
          user_id: userId,
          generated_date: today,
          category: category,
          questions: conversationData.questions,
          difficulty_level: difficulty,
          relationship_stage: 'rediscovering'
        })
        .select()
        .single()

      if (error) {
        console.log('   Database error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('9. Database save successful:', data)

      return NextResponse.json({
        success: true,
        conversations: conversationData,
        saved: data
      })

    } catch (dbError) {
      console.log('   Database operation failed:', dbError)
      throw dbError
    }

  } catch (error) {
    console.error('=== API Error ===', error)
    return NextResponse.json({ 
      error: 'Failed to generate conversation starters',
      details: error.message,
      step: 'Check server logs for details'
    }, { status: 500 })
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Conversation API is working',
    timestamp: new Date().toISOString()
  })
}
