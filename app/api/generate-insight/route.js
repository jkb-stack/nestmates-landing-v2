import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { userPreferences, forceNew } = await request.json()
    
    console.log('Insight API called with:', { userPreferences, forceNew })
    
    // 15 different psychology themes for variety
    const psychologyThemes = [
      'emotional reconnection after parenting phase',
      'rediscovering individual identity in partnership', 
      'building new shared rituals and traditions',
      'navigating intimacy changes with age',
      'creating future dreams and goals together',
      'handling empty nest adjustment emotions',
      'strengthening communication in midlife',
      'rekindling passion and romance',
      'building trust through vulnerability',
      'processing grief of parenting phase ending',
      'exploring new shared interests together',
      'managing retirement transition as couple',
      'deepening emotional intimacy',
      'celebrating relationship milestones',
      'adapting to physical changes together'
    ]
    
    // Research sources for credibility
    const researchSources = [
      'Gottman Institute, 2023',
      'Harvard Relationship Lab, 2022', 
      'UCLA Psychology Research, 2024',
      'Stanford Center for Longevity, 2023',
      'American Psychological Association, 2024',
      'Journal of Marriage and Family, 2023',
      'University of Rochester, 2022',
      'Berkeley Institute for Couples, 2024',
      'Yale Psychology Department, 2023',
      'Northwestern University, 2024'
    ]
    
    // Get random theme and source
    const selectedTheme = psychologyThemes[Math.floor(Math.random() * psychologyThemes.length)]
    const selectedSource = researchSources[Math.floor(Math.random() * researchSources.length)]
    const uniqueSeed = Date.now() + Math.random()
    
    console.log('Selected theme:', selectedTheme)
    console.log('Selected research source:', selectedSource)
    console.log('Force new insight:', forceNew)
    
    const prompt = `You are a relationship psychology expert specializing in empty nest couples.

FOCUS THEME: ${selectedTheme}
RESEARCH SOURCE: ${selectedSource}
UNIQUE SEED: ${uniqueSeed}
LOCATION: ${userPreferences.city}, ${userPreferences.state}
INTERESTS: ${userPreferences.interests?.join(', ') || 'general relationship growth'}

Create a daily relationship insight focused specifically on "${selectedTheme}".

AVOID: Any focus on food, cooking, or culinary activities (unless psychologically relevant to the theme).

INCLUDE: Reference to neuroscience or psychology research about ${selectedTheme}.

Return ONLY a JSON object:
{
  "title": "Specific title about ${selectedTheme}",
  "content": "2 paragraph insight explaining the psychology and neuroscience behind ${selectedTheme}. Reference specific brain regions, hormones, or psychological concepts. Make it personal and actionable for empty nest couples in ${userPreferences.city}.",
  "exercise": "One specific 5-10 minute exercise they can do today to practice ${selectedTheme}. Make it concrete and doable.",
  "psychology_source": "${selectedSource}"
}

Make each insight unique and scientifically grounded. Focus on the emotional and neurological aspects of ${selectedTheme}.`

    console.log('Sending insight prompt to OpenAI...')

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a relationship psychology expert. Always return valid JSON only. Focus on neuroscience and evidence-based psychology."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.85,
      max_tokens: 600,
      presence_penalty: 0.7,
      frequency_penalty: 0.9
    })

    const aiResponse = completion.choices[0].message.content
    console.log('Raw insight AI response:', aiResponse)
    
    // Parse the JSON response
    let parsedInsight
    try {
      parsedInsight = JSON.parse(aiResponse)
      console.log('Successfully parsed insight:', parsedInsight.title)
    } catch (parseError) {
      console.error('Failed to parse insight response:', parseError)
      // Fallback response
      parsedInsight = {
        title: `Understanding ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}`,
        content: `The transition to empty nest life creates unique psychological challenges, particularly around ${selectedTheme}. Research from neuroscience shows that our brains are highly adaptable, even in midlife. \n\nBy understanding the science behind ${selectedTheme}, couples can navigate this transition more successfully and build even stronger connections.`,
        exercise: `Take 5 minutes today to discuss one specific aspect of ${selectedTheme} with your partner. Share your honest feelings without trying to solve anything.`,
        psychology_source: selectedSource
      }
    }

    console.log('Returning insight:', parsedInsight)
    return Response.json(parsedInsight)

  } catch (error) {
    console.error('Insight API Error:', error)
    return Response.json({ 
      error: 'Failed to generate insight',
      details: error.message 
    }, { status: 500 })
  }
}
