export async function POST(request) {
  try {
    const { userPreferences, customPreferences } = await request.json()
    
    console.log('Date API called with:', { userPreferences, customPreferences })
    
    let customPrompt = ""
    if (customPreferences) {
      const vibeMap = {
        'romantic': 'romantic and intimate',
        'adventure': 'adventurous and active',
        'cultural': 'cultural and educational', 
        'cozy': 'cozy and relaxing',
        'fun': 'fun and playful',
        'upscale': 'upscale and sophisticated'
      }
      
      customPrompt = `
CUSTOM PREFERENCES (MUST FOLLOW):
- Vibe: ${vibeMap[customPreferences.vibe] || 'romantic'}
- Budget: Maximum $${customPreferences.budget} total
- Distance: Within ${customPreferences.distance} miles of ${userPreferences.city}
- Time: ${customPreferences.timeOfDay || 'evening'}
- Duration: ${customPreferences.duration || 'half-day'}
- Setting: ${customPreferences.setting || 'either'}

FOCUS ON THESE PREFERENCES.`
    }

    const prompt = `You are a local date expert for ${userPreferences.city}, ${userPreferences.state}. 

${customPrompt}

Create ONE perfect date recommendation. 

Return ONLY a JSON object:
{
  "recommendations": {
    "primaryDate": {
      "title": "Specific descriptive title",
      "description": "2-3 sentence description that sounds exciting",
      "timeline": ["Time - Activity", "Time - Activity", "Time - Activity"],
      "totalCost": "$X - $Y",
      "venues": [
        {
          "name": "Venue name",
          "activity": "What you'll do there",
          "address": "General area in ${userPreferences.city}"
        }
      ]
    }
  }
}

Make it fun and match their preferences exactly.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a local date expert. Always return valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 600
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content
    
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (parseError) {
      parsedResponse = {
        recommendations: {
          primaryDate: {
            title: customPreferences ? `${customPreferences.vibe} Date Night` : "Perfect Local Date",
            description: `A wonderful experience in ${userPreferences.city} designed just for you two.`,
            timeline: ["Evening - Start your adventure", "Middle - Enjoy main activity", "End - Perfect conclusion"],
            totalCost: customPreferences ? `$0 - $${customPreferences.budget}` : "$25 - $75",
            venues: [{
              name: `Local ${userPreferences.city} venue`,
              activity: "Explore and enjoy together",
              address: `${userPreferences.city} area`
            }]
          }
        }
      }
    }

    return Response.json(parsedResponse)

  } catch (error) {
    console.error('Date API Error:', error)
    return Response.json({ 
      error: 'Failed to generate date recommendations',
      details: error.message 
    }, { status: 500 })
  }
}
