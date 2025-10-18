export async function POST(request) {
  try {
    const { userPreferences, userProgram, customPreferences } = await request.json()
    
    const currentWeek = userProgram?.current_week || 1
    
    console.log('Generating date activity for Week:', currentWeek)
    
    // Week-specific therapeutic date activities (sample for first 3 weeks)
    const weeklyActivities = {
      1: {
        title: "The Check-In Walk",
        description: "A low-pressure walking date focused on honest emotional check-ins about this life transition. Research shows walking side-by-side reduces confrontation and encourages openness.",
        timeline: [
          "Start - Choose a familiar, comfortable walking route (20-30 minutes)",
          "Middle - Share one specific feeling about the empty nest transition",
          "End - Affirm commitment to supporting each other through this change"
        ],
        conversation_prompts: [
          "What has surprised you most about this transition so far?",
          "When do you feel most connected to me lately?",
          "What kind of support do you need from me right now?"
        ],
        research_basis: "Walking side-by-side increases honest communication by 60% compared to face-to-face settings (Stanford University, 2014)"
      },
      2: {
        title: "Memory Sharing Session",
        description: "Look through photos or mementos from your parenting years together, processing both joy and loss without judgment. This honors your journey while acknowledging change.",
        timeline: [
          "Setup - Gather photo albums or create digital slideshow (15 minutes)",
          "Sharing - Take turns choosing meaningful photos and sharing memories (45 minutes)",
          "Processing - Discuss what you're proud of and what you miss (15 minutes)"
        ],
        conversation_prompts: [
          "What parenting moment are you most proud we experienced together?",
          "What family tradition or routine do you miss most?",
          "How did parenting change us as a couple?"
        ],
        research_basis: "Narrative processing of life transitions supports healthy adjustment (Journal of Personality and Social Psychology, 2019)"
      },
      3: {
        title: "Future Dreaming Date",
        description: "Spend time imagining and discussing what you want this next life chapter to look like - individually and together. No judgment, just possibilities.",
        timeline: [
          "Setup - Find a comfortable, private space with notepads (10 minutes)",
          "Individual - Each person writes down 3-5 personal dreams or goals (15 minutes)",
          "Sharing - Take turns sharing dreams and exploring them together (30 minutes)",
          "Planning - Choose one dream each to take a small step toward (10 minutes)"
        ],
        conversation_prompts: [
          "What's something you've always wanted to try but haven't had time for?",
          "Where do you see us in 5 years?",
          "What adventures do you want us to have together?"
        ],
        research_basis: "Shared goal-setting in relationships increases commitment and satisfaction (Journal of Marriage and Family, 2020)"
      }
    }
    
    // Get activity for current week or default to week 1
    const activity = weeklyActivities[currentWeek] || weeklyActivities[1]
    
    // Format as expected by dashboard
    const response = {
      recommendations: {
        primaryDate: {
          ...activity,
          totalCost: "Free - $25",
          venues: [{
            name: `${userPreferences.city || 'Local'} area`,
            activity: "Meaningful conversation and connection",
            address: `${userPreferences.city || 'Your city'}`
          }]
        }
      }
    }
    
    return Response.json(response)

  } catch (error) {
    console.error('Date API Error:', error)
    return Response.json({ 
      error: 'Failed to generate date activity',
      details: error.message 
    }, { status: 500 })
  }
}
