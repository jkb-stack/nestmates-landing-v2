import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { userPreferences, customPreferences } = await request.json()
    
    console.log('Date API called with:', { userPreferences, customPreferences })
    
    // Enhanced themes with more variety
    const themes = [
      'romantic sunset experience', 'culinary adventure', 'artistic exploration', 'outdoor adventure',
      'wellness and relaxation', 'entertainment and fun', 'cultural immersion', 'cozy indoor activities',
      'social and community', 'learning and growth', 'nostalgic recreation', 'seasonal celebration',
      'spontaneous discovery', 'luxury indulgence', 'active recreation'
    ]
    
    // Get random theme
    const randomTheme = themes[Math.floor(Math.random() * themes.length)]
    const uniqueSeed = Date.now() + Math.random()
    
    console.log('Selected theme:', randomTheme)
    console.log('Custom preferences received:', customPreferences)
    
    // Build custom preferences prompt
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
      
      const timeMap = {
        'morning': 'morning time',
        'afternoon': 'afternoon time', 
        'evening': 'evening time',
        'all-day': 'all day long'
      }
      
      const durationMap = {
        'quick': '1-2 hours',
        'half-day': '3-5 hours', 
        'full-day': '6+ hours'
      }
      
      const settingMap = {
        'indoor': 'indoor activities only',
        'outdoor': 'outdoor activities only',
        'either': 'indoor or outdoor activities'
      }
      
      customPrompt = `
IMPORTANT CUSTOM PREFERENCES (MUST FOLLOW):
- Vibe: ${vibeMap[customPreferences.vibe] || 'romantic'}
- Budget: Maximum $${customPreferences.budget} total
- Distance: Within ${customPreferences.distance} miles of ${userPreferences.city}
- Time: ${timeMap[customPreferences.timeOfDay] || 'evening'}
- Duration: ${durationMap[customPreferences.duration] || 'half day'}
- Setting: ${settingMap[customPreferences.setting] || 'either'}

FOCUS ON THEIR PREFERENCES ABOVE ALL ELSE.`
    }

    const prompt = `You are a local date expert for ${userPreferences.city}, ${userPreferences.state}. 

${customPrompt}

Theme focus: ${randomTheme}
User interests: ${userPreferences.interests?.join(', ') || 'varied activities'}
Unique seed: ${uniqueSeed}

Create ONE perfect date recommendation that ${customPreferences ? 'EXACTLY matches their custom preferences above' : 'matches their general profile'}. 

Return ONLY a JSON object with this structure:
{
  "recommendations": {
    "primaryDate": {
      "title": "Specific descriptive title",
      "description": "2-3 sentence description that sounds exciting",
      "timeline": ["Time - Activity", "Time - Activity", "Time - Activity"],
      "totalCost": "$X - $Y" (within their budget),
      "venues": [
        {
          "name": "Actual venue name or type",
          "activity": "What you'll do there",
          "address": "General area in ${userPreferences.city}"
        }
      ]
    }
  }
}

Make it sound fun and doable. ${customPreferences ? `CRITICAL: Stay within $${customPreferences.budget} budget and ${customPreferences.distance} mile radius.` : ''}`

    console.log('Sending prompt to OpenAI:', prompt.substring(0, 200) + '...')

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are a helpful local date recommendation assistant. Always return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 800,
      presence_penalty: 0.6,
      frequency_penalty: 0.8
    })

    const aiResponse = completion.choices[0].message.content
    console.log('Raw AI response:', aiResponse)
    
    // Parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
      console.log('Successfully parsed date recommendation:', parsedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback response
      parsedResponse = {
        recommendations: {
          primaryDate: {
            title: customPreferences ? `Custom ${customPreferences.vibe} Date` : "Perfect Local Date",
            description: `A wonderful ${customPreferences?.vibe || 'romantic'} experience in ${userPreferences.city} designed just for you two.`,
            timeline: [
              `${customPreferences?.timeOfDay || 'Evening'} - Start your adventure`,
              "Middle - Enjoy main activity", 
              "End - Perfect conclusion"
            ],
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
