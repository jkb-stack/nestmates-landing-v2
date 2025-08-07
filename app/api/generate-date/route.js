import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userPreferences, forceNew = false } = await request.json()
    const { city, state, interests, budget } = userPreferences

    console.log('Generating date with preferences:', { city, state, interests, budget, forceNew })

    // Add randomization to ensure different results each time
    const currentTime = new Date().getTime()
    const randomSeed = Math.floor(Math.random() * 1000)
    
    // Diverse date themes to rotate through
    const dateThemes = [
      'romantic evening',
      'adventure together', 
      'cultural exploration',
      'outdoor fun',
      'cozy indoor activities',
      'foodie experience',
      'wellness and relaxation',
      'entertainment and shows',
      'local hidden gems',
      'seasonal activities'
    ]
    
    // Select random theme
    const selectedTheme = dateThemes[Math.floor(Math.random() * dateThemes.length)]
    
    // Enhanced AI prompt for more variety
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
            content: `You are a creative date planning expert for empty nest couples. Create unique, diverse date ideas that avoid repetition. Focus on ${selectedTheme} theme. Each response should be completely different from previous suggestions.`
          },
          {
            role: "user",
            content: `Create ONE unique ${selectedTheme} date idea for empty nesters in ${city}, ${state}.

User context:
- Interests: ${interests}
- Budget: ${budget}
- Theme: ${selectedTheme}
- Time: ${new Date().toLocaleTimeString()} (use current time for uniqueness)
- Random seed: ${randomSeed}

Requirements:
- Be specific and creative (not generic)
- Include actual timing and activities
- Make it feel special and unique
- Perfect for couples 50-65 years old
- Consider current season: ${new Date().toLocaleDateString('en-US', { month: 'long', season: 'long' })}

Format as JSON:
{
  "primaryDate": {
    "title": "Creative, specific title (not generic)",
    "description": "Detailed 2-3 sentence description explaining why this is perfect",
    "timeline": ["Specific time - Specific activity", "Another time - Another activity"],
    "totalCost": "$X-Y estimate",
    "venues": [
      {"name": "Specific venue name", "activity": "What you'll do there"}
    ],
    "theme": "${selectedTheme}",
    "uniqueElements": ["What makes this date special", "Another unique aspect"]
  }
}

Make this completely unique and avoid typical suggestions like "dinner and a movie."`
          }
        ],
        max_tokens: 600,
        temperature: 0.9, // High creativity for variety
        presence_penalty: 0.6, // Avoid repetitive content
        frequency_penalty: 0.8, // Encourage new words/phrases
        top_p: 0.95 // Allow for creative responses
      })
    })

    const aiData = await aiResponse.json()
    
    console.log('AI response status:', aiResponse.status)
    console.log('AI response data:', aiData)

    if (!aiData.choices || !aiData.choices[0]) {
      console.error('No AI response choices')
      throw new Error('No response from AI')
    }

    let dateRecommendations
    try {
      dateRecommendations = JSON.parse(aiData.choices[0].message.content)
      console.log('Parsed date recommendations:', dateRecommendations)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.log('Raw AI content:', aiData.choices[0].message.content)
      
      // Fallback with unique elements
      const fallbackThemes = [
        {
          title: "Sunset Photography Walk & Wine Tasting",
          description: "Capture golden hour moments together while exploring local wineries. A perfect blend of creativity and romance for couples rediscovering shared passions.",
          timeline: ["5:30 PM - Start at scenic overlook", "6:30 PM - Local winery tasting", "8:00 PM - Dinner with sunset views"],
          totalCost: "$60-100",
          venues: [{"name": "Local winery district", "activity": "Photography and wine tasting"}]
        },
        {
          title: "Morning Market Adventure & Cooking Class",
          description: "Shop together at the farmer's market, then learn to cook a new cuisine. Perfect for couples who want to create lasting memories through food.",
          timeline: ["9:00 AM - Farmer's market exploration", "11:00 AM - Couples cooking class", "1:00 PM - Enjoy your creation together"],
          totalCost: "$80-120",
          venues: [{"name": "Local culinary school", "activity": "Market shopping and cooking"}]
        }
      ]
      
      const randomFallback = fallbackThemes[Math.floor(Math.random() * fallbackThemes.length)]
      dateRecommendations = { primaryDate: randomFallback }
    }

    // Add timestamp and uniqueness indicators
    dateRecommendations.generated_at = new Date().toISOString()
    dateRecommendations.theme_used = selectedTheme
    dateRecommendations.random_seed = randomSeed

    console.log('Final date recommendations being returned:', dateRecommendations)

    return NextResponse.json({
      success: true,
      recommendations: dateRecommendations,
      theme: selectedTheme,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Date generation error:', error)
    
    // Enhanced fallback with variety
    const fallbackOptions = [
      {
        title: `Explore ${userPreferences?.city || 'Your City'} Like Tourists`,
        description: "Sometimes the best adventures are in your own backyard. Discover hidden gems and see your city with fresh eyes.",
        timeline: ["Morning - Visit local attractions you've never seen", "Afternoon - Try a new restaurant", "Evening - Walk through a different neighborhood"],
        totalCost: "$40-80",
        venues: [{"name": "Local attractions", "activity": "Tourist activities in your own city"}],
        theme: "local exploration"
      },
      {
        title: "Cozy Coffee Shop Literature Hour",
        description: "Find a charming local café, bring books or poetry, and share favorite passages with each other over great coffee.",
        timeline: ["2:00 PM - Find perfect coffee spot", "3:00 PM - Reading and discussion time", "4:30 PM - Walk to nearby bookstore"],
        totalCost: "$15-30",
        venues: [{"name": "Independent coffee shop", "activity": "Reading and intimate conversation"}],
        theme: "intellectual connection"
      }
    ]
    
    const randomFallback = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)]
    
    return NextResponse.json({
      success: true,
      recommendations: { primaryDate: randomFallback },
      fallback: true,
      generated_at: new Date().toISOString()
    })
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Enhanced Date Generation API',
    features: ['Theme rotation', 'High creativity', 'Uniqueness enforcement'],
    timestamp: new Date().toISOString()
  })
}
