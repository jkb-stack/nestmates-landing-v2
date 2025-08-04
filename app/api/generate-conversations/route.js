import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('POST request received')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { userId, userPreferences, category = 'reconnection', difficulty = 'medium' } = body

    // Simple test response first
    const testQuestions = {
      questions: [
        {
          question: "What's your favorite memory from this year?",
          followUp: "What made that moment special?",
          explanation: "Sharing positive memories strengthens emotional bonds.",
          difficulty: difficulty
        },
        {
          question: "What's something new you'd like to try together?",
          followUp: "Why do you think it would bring you closer?",
          explanation: "Exploring new experiences together builds intimacy.",
          difficulty: difficulty
        },
        {
          question: "How do you feel most loved by me?",
          followUp: "Is there a way I could express that more often?",
          explanation: "Understanding love languages improves connection.",
          difficulty: difficulty
        }
      ],
      category: category,
      categoryDescription: `Questions about ${category}`
    }

    console.log('Returning test questions')

    return NextResponse.json({
      success: true,
      conversations: testQuestions
    })

  } catch (error) {
    console.error('POST Error:', error)
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
