export async function POST(request) {
  try {
    const { userPreferences, forceNew } = await request.json()
    
    console.log('Insight API called with:', { userPreferences, forceNew })
    
    // Psychology themes for variety
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
    
    // Research sources
    const researchSources = [
      'Gottman Institute, 2023',
      'Harvard Relationship Lab, 2022', 
      'UCLA Psychology Research, 2024',
      'Stanford Center for Longevity, 2023',
      'American Psychological Association, 2024'
    ]
    
    const selectedTheme = psychologyThemes[Math.floor(Math.random() * psychologyThemes.length)]
    const selectedSource = researchSources[Math.floor(Math.random() * researchSources.length)]
    
    console.log('Selected theme:', selectedTheme)
    
    const prompt = `You are a relationship psychology expert specializing in empty nest couples.

FOCUS THEME: ${selectedTheme}
RESEARCH SOURCE: ${selectedSource}
LOCATION: ${userPreferences.city}, ${userPreferences.state}
INTERESTS: ${userPreferences.interests?.join(', ') || 'general relationship growth'}

Create a daily relationship insight focused specifically on "${selectedTheme}".

Return ONLY a JSON object:
{
  "title": "Specific title about ${selectedTheme}",
  "content": "2 paragraph insight explaining the psychology behind ${selectedTheme}. Make it personal and actionable for empty nest couples.",
  "exercise": "One specific 5-10 minute exercise they can do today to practice ${selectedTheme}.",
  "psychology_source": "${selectedSource}"
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a relationship psychology expert. Always return valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content
    
    let parsedInsight
    try {
      parsedInsight = JSON.parse(aiResponse)
    } catch (parseError) {
      parsedInsight = {
        title: `Understanding ${selectedTheme}`,
        content: `The transition to empty nest life creates unique psychological challenges around ${selectedTheme}. This period offers opportunities to deepen your connection in new ways.\n\nBy focusing on ${selectedTheme}, couples can build stronger foundations for this next chapter of their relationship.`,
        exercise: `Take 10 minutes today to discuss ${selectedTheme} with your partner. Share your honest thoughts and listen without judgment.`,
        psychology_source: selectedSource
      }
    }

    return Response.json(parsedInsight)

  } catch (error) {
    console.error('Insight API Error:', error)
    return Response.json({ 
      error: 'Failed to generate insight',
      details: error.message 
    }, { status: 500 })
  }
}
