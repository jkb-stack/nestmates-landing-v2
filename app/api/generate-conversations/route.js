export async function POST(request) {
  try {
    const { userProgram } = await request.json()
    
    const currentWeek = userProgram?.current_week || 1
    
    console.log('Generating conversations for Week:', currentWeek)
    
    // Week-specific conversation starters (sample for first 3 weeks)
    const weeklyConversations = {
      1: [
        {
          question: "What surprised you most about this transition?",
          category: "Processing Feelings",
          context: "Empty nest feelings often catch us off guard, even when we knew they were coming.",
          why_it_matters: "Naming surprises helps us process unexpected emotions and reduces the sense of being 'caught off guard' by our own feelings.",
          follow_ups: [
            "What did you expect to feel vs. what you actually felt?",
            "Have any of your expectations shifted this week?"
          ],
          research_source: "UCLA Longevity Center research on anticipatory emotions, 2024"
        },
        {
          question: "When do you feel most connected to me right now?",
          category: "Us as a Couple",
          context: "As our daily routines shift, connection points change too.",
          why_it_matters: "Identifying current connection moments helps us recognize what's working and build on it intentionally.",
          follow_ups: [
            "What small moments have felt meaningful lately?",
            "What would help you feel more connected this week?"
          ],
          research_source: "Gottman Institute relationship maintenance research, 2023"
        },
        {
          question: "What part of our parenting journey are you most proud of?",
          category: "Looking Back",
          context: "Acknowledging what we accomplished together strengthens our foundation.",
          why_it_matters: "Celebrating shared achievements reinforces couple identity and provides perspective during transitions.",
          follow_ups: [
            "What's a specific moment that stands out?",
            "How did we grow as a team through parenting?"
          ],
          research_source: "Journal of Family Psychology, 2024"
        }
      ],
      2: [
        {
          question: "How has your daily routine changed, and how does that feel?",
          category: "Processing Feelings",
          context: "Routine changes affect us more than we realize - our brains are wired for patterns.",
          why_it_matters: "Acknowledging routine disruption validates the adjustment challenge and helps us create new patterns intentionally.",
          follow_ups: [
            "What new routines are you trying to establish?",
            "What old routine do you miss most?"
          ],
          research_source: "Stanford Neuroscience Institute, habit formation research, 2023"
        },
        {
          question: "What's something about yourself you want to rediscover?",
          category: "Self Discovery",
          context: "Parenting often puts personal interests on hold. Now there's space to explore again.",
          why_it_matters: "Reconnecting with personal interests strengthens individual identity, which actually improves relationship satisfaction.",
          follow_ups: [
            "What did you used to love doing before kids?",
            "What's one small step you could take this week toward that?"
          ],
          research_source: "Northwestern University Psychology, identity development, 2024"
        },
        {
          question: "How can I better support you during this transition?",
          category: "Us as a Couple",
          context: "We each process change differently - direct communication helps us understand each other's needs.",
          why_it_matters: "Explicitly asking for and offering support prevents assumptions and strengthens partnership during change.",
          follow_ups: [
            "What kind of support is most helpful to you right now?",
            "Are there things I'm doing that aren't helpful?"
          ],
          research_source: "Gottman Institute, couples communication research, 2023"
        }
      ],
      3: [
        {
          question: "What's one fear or worry you have about this life stage?",
          category: "Processing Feelings",
          context: "Voicing fears reduces their power and allows us to address them together.",
          why_it_matters: "Shared vulnerability during transitions deepens intimacy and creates emotional safety in the relationship.",
          follow_ups: [
            "What would make that worry feel more manageable?",
            "How can we face this concern together?"
          ],
          research_source: "American Psychological Association, vulnerability research, 2024"
        },
        {
          question: "What dreams or goals do you have for yourself in the next year?",
          category: "Future Dreams",
          context: "With more time and freedom, new possibilities open up for personal growth.",
          why_it_matters: "Setting individual goals within a relationship strengthens both personal fulfillment and couple satisfaction.",
          follow_ups: [
            "What would taking a first step toward that look like?",
            "How can I support your goals?"
          ],
          research_source: "Journal of Marriage and Family, goal-setting in relationships, 2023"
        },
        {
          question: "What's a quality I have that you've appreciated lately?",
          category: "Us as a Couple",
          context: "During stressful transitions, we often forget to express appreciation.",
          why_it_matters: "Regular appreciation increases relationship satisfaction by 40% and buffers against transition stress.",
          follow_ups: [
            "What's a specific moment when you saw that quality?",
            "What quality of yours do you hope I notice?"
          ],
          research_source: "University of California Berkeley, gratitude research, 2024"
        }
      ]
    }
    
    // Get conversations for current week or default to week 1
    const conversations = weeklyConversations[currentWeek] || weeklyConversations[1]
    
    return Response.json({ conversations })

  } catch (error) {
    console.error('Conversations API Error:', error)
    return Response.json({ 
      error: 'Failed to generate conversations',
      details: error.message 
    }, { status: 500 })
  }
}
