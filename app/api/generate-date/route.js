import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userPreferences } = await request.json()
    const { city, state, interests, budget } = userPreferences

    // Step 1: Search Google Places for venues
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${interests} ${city} ${state}`)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    )
    const placesData = await placesResponse.json()

    if (!placesData.results || placesData.results.length === 0) {
      throw new Error('No places found')
    }

    // Get top 5 places
    const topPlaces = placesData.results.slice(0, 5).map(place => ({
      name: place.name,
      rating: place.rating,
      address: place.formatted_address,
      types: place.types,
      priceLevel: place.price_level || 2
    }))

    // Step 2: Use OpenAI to create perfect date plan
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
            content: `You are a local date planning expert for empty nester couples. Create romantic, age-appropriate date recommendations for couples in their 50s-60s who want to reconnect after their children have left home.`
          },
          {
            role: "user",
            content: `Create 3 perfect date recommendations for empty nesters in ${city}, ${state}. Their interests: ${interests}. Budget: ${budget}.

Available venues: ${JSON.stringify(topPlaces)}

Format as JSON:
{
  "primaryDate": {
    "title": "Romantic evening title",
    "description": "2-3 sentences about why this is perfect",
    "timeline": ["6:00 PM - Activity 1", "8:00 PM - Activity 2"],
    "totalCost": "$80-120",
    "venues": [{"name": "venue", "activity": "what to do"}]
  },
  "alternativeDate1": {similar format},
  "alternativeDate2": {similar format}
}

Focus on: reconnection, conversation, new experiences, age-appropriate activities.`
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    })

    const aiData = await aiResponse.json()
    const dateRecommendations = JSON.parse(aiData.choices[0].message.content)

    return NextResponse.json({
      success: true,
      recommendations: dateRecommendations,
      venues: topPlaces
    })

  } catch (error) {
    console.error('Date generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate date recommendations',
      details: error.message 
    }, { status: 500 })
  }
}
