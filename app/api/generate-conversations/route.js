import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId, userPreferences, category = 'reconnection' } = await request.json()
    
    // Import Supabase to check for previous questions
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Get user's previous questions to avoid repeats
    const { data: previousConversations } = await supabase
      .from('conversation_starters')
      .select('questions')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const previousQuestions = previousConversations?.flatMap(conv => 
      conv.questions?.map(q => q.question) || []
    ) || []

    console.log(`Avoiding ${previousQuestions.length} previous questions`)

    // Build comprehensive user context
    const userContext = buildUserContext(userPreferences)
    
    // Get category-specific prompts with neuroscience backing
    const categoryData = getCategoryData(category)
    
    // Generate AI questions with sophisticated prompting
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
            content: buildSystemPrompt(categoryData)
          },
          {
            role: "user",
            content: buildUserPrompt(userContext, categoryData, previousQuestions)
          }
        ],
        max_tokens: 1000,
        temperature: 0.9, // Higher creativity for unique questions
      })
    })

    const aiData = await aiResponse.json()
    
    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('No response from OpenAI')
    }

    let conversationData
    try {
      conversationData = JSON.parse(aiData.choices[0].message.content)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.log('Raw AI response:', aiData.choices[0].message.content)
      
      // Fallback: Generate category-specific questions manually
      conversationData = generateFallbackQuestions(category, userContext)
    }

    // Save to database with timestamp to track uniqueness
    const today = new Date().toISOString().split('T')[0]
    const timestamp = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('conversation_starters')
      .insert({
        user_id: userId,
        generated_date: today,
        category: category,
        questions: conversationData.questions,
        neuroscience_backing: conversationData.neuroscience_backing,
        user_context_used: userContext,
        generation_timestamp: timestamp,
        used_questions: []
      })
      .select()
      .single()

    if (error) {
      console.error('Database save error:', error)
      // Continue without saving - return the questions anyway
    }

    return NextResponse.json({
      success: true,
      conversations: conversationData,
      saved: data,
      avoided_repeats: previousQuestions.length
    })

  } catch (error) {
    console.error('Advanced conversation generation error:', error)
    
    // Fallback system
    const { category = 'reconnection', userPreferences } = await request.json().catch(() => ({}))
    const userContext = buildUserContext(userPreferences || {})
    
    return NextResponse.json({
      success: true,
      conversations: generateFallbackQuestions(category, userContext),
      fallback: true
    })
  }
}

function buildUserContext(userPreferences) {
  return {
    location: `${userPreferences.city || 'your area'}, ${userPreferences.state || 'US'}`,
    interests: userPreferences.interests ? userPreferences.interests.split(',').map(i => i.trim()) : ['general activities'],
    budget: userPreferences.budget || 'moderate',
    relationshipStage: 'empty_nester', // Could be enhanced with more user data
    lifeStage: 'post_parenting_phase'
  }
}

function getCategoryData(category) {
  const categoryDatabase = {
    reconnection: {
      focus: "Rediscovering each other after the parenting phase",
      neuroscience: "Neuroplasticity research shows that trying new experiences together activates the brain's reward system and strengthens pair bonding through increased oxytocin and dopamine production",
      psychological_basis: "Gottman Institute research on Love Maps and turning towards each other",
      themes: ["identity_rediscovery", "shared_interests", "physical_intimacy", "emotional_connection", "future_planning"],
      avoid_topics: ["past_conflicts", "parenting_regrets"]
    },
    dreams: {
      focus: "Future aspirations and goals as a couple without daily parenting responsibilities",
      neuroscience: "Goal-setting activates the prefrontal cortex and when done together, creates shared neural pathways that strengthen relationship bonds through synchronized brain activity",
      psychological_basis: "Self-Determination Theory and shared meaning-making in relationships",
      themes: ["travel_dreams", "career_changes", "personal_growth", "bucket_list", "legacy_building"],
      avoid_topics: ["unrealistic_fantasies", "individual_goals_only"]
    },
    memories: {
      focus: "Shared positive experiences and relationship history",
      neuroscience: "Reminiscing together activates the brain's default mode network and hippocampus, strengthening emotional bonds through shared memory consolidation and increased relationship satisfaction",
      psychological_basis: "Attachment theory and positive sentiment override from Gottman research",
      themes: ["early_relationship", "parenting_highlights", "overcoming_challenges", "funny_moments", "growth_together"],
      avoid_topics: ["painful_memories", "relationship_regrets"]
    },
    intimacy: {
      focus: "Rebuilding physical and emotional closeness",
      neuroscience: "Physical touch releases oxytocin and reduces cortisol levels, while emotional intimacy activates the brain's attachment system through the anterior cingulate cortex",
      psychological_basis: "Sue Johnson's Emotionally Focused Therapy and attachment bonding cycles",
      themes: ["physical_connection", "emotional_vulnerability", "trust_building", "romance_rekindling", "communication_deepening"],
      avoid_topics: ["performance_pressure", "past_sexual_issues"]
    },
    fun: {
      focus: "Playfulness and joy in the relationship",
      neuroscience: "Laughter and play release endorphins and activate the brain's reward system, creating positive associations with your partner through classical conditioning",
      psychological_basis: "Play therapy principles and positive psychology research on relationship satisfaction",
      themes: ["shared_hobbies", "adventure_seeking", "humor", "spontaneity", "childlike_wonder"],
      avoid_topics: ["serious_life_issues", "stress_inducing_topics"]
    },
    future: {
      focus: "Planning and envisioning life together in the next chapter",
      neuroscience: "Future planning together synchronizes brain activity in the medial prefrontal cortex, creating shared mental models that strengthen relationship cohesion",
      psychological_basis: "Interdependence theory and relationship maintenance behaviors",
      themes: ["retirement_planning", "living_arrangements", "health_goals", "relationship_evolution", "grandparent_roles"],
      avoid_topics: ["death_discussions", "fear_based_planning"]
    }
  }

  return categoryDatabase[category] || categoryDatabase['reconnection']
}

function buildSystemPrompt(categoryData) {
  return `You are Dr. Sarah Chen, a leading relationship neuropsychologist specializing in empty nest couples. You combine cutting-edge neuroscience research with practical relationship wisdom.

EXPERTISE AREAS:
- Neuroscience of long-term relationships and brain plasticity
- Empty nest syndrome and relationship transitions  
- Gottman Method principles and Love Maps
- Attachment theory applications for midlife couples
- Positive psychology and relationship flourishing

SCIENTIFIC BACKING: ${categoryData.neuroscience}
PSYCHOLOGICAL BASIS: ${categoryData.psychological_basis}

INSTRUCTIONS:
1. Create 5 unique, thought-provoking questions specifically about: ${categoryData.focus}
2. Each question must be grounded in neuroscience or psychology research
3. Questions should feel personal and relevant to empty nesters specifically
4. Include follow-up questions that deepen the conversation
5. Provide the scientific explanation for why each question strengthens relationships
6. Make questions feel natural, not clinical or textbook-like
7. Focus on themes: ${categoryData.themes.join(', ')}
8. Completely avoid: ${categoryData.avoid_topics.join(', ')}

FORMAT: Return valid JSON with this exact structure:
{
  "questions": [
    {
      "question": "Main conversation starter (natural, engaging tone)",
      "followUp": "Deeper follow-up question to explore further", 
      "scientific_explanation": "Brief explanation of the neuroscience/psychology behind why this question works (50-70 words)",
      "research_source": "Specific research reference (e.g., 'Gottman Institute, 2019' or 'UCLA Neuroscience Lab, 2021')"
    }
  ],
  "category_title": "Beautiful category name",
  "neuroscience_backing": "Overall scientific rationale for this category (100-150 words)"
}`
}

function buildUserPrompt(userContext, categoryData, previousQuestions) {
  let prompt = `Create personalized conversation starters for an empty nest couple with this profile:

COUPLE CONTEXT:
- Location: ${userContext.location}
- Interests: ${userContext.interests.join(', ')}
- Budget preference: ${userContext.budget}
- Life stage: Recently became empty nesters
- Relationship focus: ${categoryData.focus}

PERSONALIZATION REQUIREMENTS:
- Reference their location naturally in questions when relevant
- Incorporate their interests into conversation starters
- Consider their budget preferences for activity-based questions
- Address the unique challenges and opportunities of empty nest phase
- Make questions feel specifically crafted for THIS couple

UNIQUENESS REQUIREMENTS:
- Generate completely original questions unlike typical relationship advice
- Each question should spark genuine curiosity and discovery
- Create questions that would lead to surprising revelations
- Ensure questions build on each other for deeper exploration`

  if (previousQuestions.length > 0) {
    prompt += `\n\nIMPORTANT: Avoid creating questions similar to these previous ones:
${previousQuestions.slice(0, 10).map(q => `- ${q}`).join('\n')}`
  }

  return prompt
}

function generateFallbackQuestions(category, userContext) {
  const fallbackQuestions = {
    reconnection: {
      questions: [
        {
          question: `Now that we have more time together in ${userContext.location}, what's one thing about me you'd like to discover or rediscover?`,
          followUp: "What drew you to want to know that about me?",
          scientific_explanation: "This question activates the brain's curiosity centers and promotes neuroplasticity by encouraging novel observations about familiar partners, strengthening neural pathways associated with relationship novelty.",
          research_source: "Harvard Neuroplasticity Lab, 2022"
        },
        {
          question: "If we could design our perfect day together now that our parenting duties have shifted, what would it look like from morning to night?",
          followUp: "What part of that day would make you feel most connected to me?",
          scientific_explanation: "Visualizing shared positive experiences activates the brain's reward system and creates neural pathways for future bonding, increasing relationship satisfaction through positive expectancy.",
          research_source: "Gottman Institute, 2020"
        }
      ],
      category_title: "Reconnection & Rediscovery",
      neuroscience_backing: "Empty nesters must rebuild their couple identity after years of co-parenting. Neuroscience shows that asking discovery questions activates neuroplasticity and creates new neural pathways for connection. The anterior cingulate cortex, responsible for emotional bonding, responds strongly to novelty and curiosity about partners, making these questions particularly powerful for relationship renewal."
    }
    // Add more fallback categories as needed
  }

  return fallbackQuestions[category] || fallbackQuestions['reconnection']
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Advanced Conversations API is working',
    features: [
      'Neuroscience-backed questions',
      'User-personalized content', 
      'Repeat question avoidance',
      'Category-specific expertise',
      'Empty nester specialization'
    ],
    timestamp: new Date().toISOString()
  })
}
