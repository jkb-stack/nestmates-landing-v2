import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userPreferences, previousInsights } = await request.json()
    
    // OpenAI API call to generate personalized insight
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a relationship expert specializing in empty nest syndrome. Create daily insights for couples whose children have left home. Base responses on real psychology research from Gottman Institute, attachment theory, and neuroscience of relationships.`
          },
          {
            role: "user",
            content: `Create today's relationship insight for empty nesters in ${userPreferences.city}, ${userPreferences.state}. Their interests: ${userPreferences.interests}. Budget: ${userPreferences.budget}. 

Format as JSON:
{
  "title": "Compelling title (under 60 chars)",
  "content": "2-3 paragraph insight with real psychology (200-300 words)",
  "exercise": "Specific actionable challenge for today",
  "psychology_source": "Research citation (e.g., 'Gottman Institute, 2023')"
}

Focus on: identity rediscovery, intimacy rebuilding, new shared experiences, neuroplasticity in relationships.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    const aiResponse = await response.json()
    const insight = JSON.parse(aiResponse.choices[0].message.content)

    return NextResponse.json(insight)

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 })
  }
}
