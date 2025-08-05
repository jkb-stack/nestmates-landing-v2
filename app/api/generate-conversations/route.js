import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, userPreferences, category = 'reconnection', difficulty = 'medium' } = body

    // Call OpenAI for personalized questions
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
            content: "You are a relationship expert for empty nest couples. Create thoughtful conversation starters."
          },
          {
            role: "user",
            content: `Create 3 ${difficulty} conversation questions for empty nester couples about ${category}. Location: ${userPreferences.city}, ${userPreferences.state}. Interests: ${userPreferences.interests}.

Return valid JSON:
{
  "questions": [
    {
      "question": "Question text here",
      "followUp": "Follow-up question",
      "explanation": "Why this helps relationships",
      "difficulty": "${difficulty}"
    }
  ],
  "category": "${category}",
  "categoryDescription": "About ${category}"
}`
          }
        ],
        max_tokens: 600,
        temperature: 0.8
      })
    })

    const aiData = await aiResponse.json()
    const conversationData = JSON.parse(aiData.choices[0].message.content)

    return NextResponse.json({
      success: true,
      conversations: conversationData
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate conversations',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Conversations API is working',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
  })
}
