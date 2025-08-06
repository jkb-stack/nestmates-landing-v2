'use client'
import { useState, useEffect } from 'react'
import BottomNavigation from '../components/BottomNavigation'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [todayInsight, setTodayInsight] = useState(null)
  const [dateRecommendations, setDateRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingInsight, setGeneratingInsight] = useState(false)
  const [generatingDate, setGeneratingDate] = useState(false)
  const [partnerInput, setPartnerInput] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        
        // Check if user completed onboarding
        if (!profileData.onboarding_completed) {
          window.location.href = '/onboarding'
          return
        }

        // Load today's insight
        await loadTodayInsight(user.id, profileData)
        
        // Generate date recommendations
        await generateDateRecommendations(profileData)
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTodayInsight = async (userId, userProfile) => {
    try {
      const { supabase } = await import('../supabase')
      
      // Get today's insight
      const today = new Date().toISOString().split('T')[0]
      const { data: insightData } = await supabase
        .from('daily_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('insight_date', today)
        .single()

      if (insightData) {
        setTodayInsight(insightData)
      } else {
        // Generate today's insight
        await generateTodayInsight(userId, userProfile)
      }
    } catch (error) {
      console.error('Error loading insight:', error)
    }
  }

  const generateTodayInsight = async (userId, userProfile) => {
    setGeneratingInsight(true)
    try {
      const { supabase } = await import('../supabase')

      // Call our AI API
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPreferences: {
            city: userProfile.location_city,
            state: userProfile.location_state,
            interests: userProfile.interests,
            budget: userProfile.budget
          }
        })
      })

      const aiInsight = await response.json()

      if (aiInsight.error) {
        throw new Error(aiInsight.error)
      }

      // Save to database
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_insights')
        .insert({
          user_id: userId,
          insight_date: today,
          title: aiInsight.title,
          content: aiInsight.content,
          exercise: aiInsight.exercise,
          psychology_source: aiInsight.psychology_source,
          coins_awarded: 50,
          completed: false
        })
        .select()
        .single()

      if (error) throw error

      setTodayInsight(data)

    } catch (error) {
      console.error('Error generating insight:', error)
    } finally {
      setGeneratingInsight(false)
    }
  }

  const generateDateRecommendations = async (userProfile) => {
    setGeneratingDate(true)
    try {
      const response = await fetch('/api/generate-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPreferences: {
            city: userProfile.location_city,
            state: userProfile.location_state,
            interests: userProfile.interests,
            budget: userProfile.budget
          }
        })
      })

      const dateData = await response.json()

      if (dateData.error) {
        throw new Error(dateData.error)
      }

      setDateRecommendations(dateData.recommendations)

    } catch (error) {
      console.error('Error generating date recommendations:', error)
      setDateRecommendations({
        primaryDate: {
          title: "Explore Your City Together",
          description: "Sometimes the best dates are the simplest ones. Take a walk through your neighborhood and discover something new together.",
          timeline: ["Evening - Take a stroll", "End with coffee or dessert"],
          totalCost: "Free - $20",
          venues: [{ name: "Local neighborhood", activity: "Walking and exploring" }]
        }
      })
    } finally {
      setGeneratingDate(false)
    }
  }

  const completeExercise = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      await supabase
        .from('daily_insights')
        .update({ completed: true })
        .eq('id', todayInsight.id)

      setTodayInsight(prev => ({ ...prev, completed: true }))
      
      alert('🎉 Great job! You earned 50 Connection Coins!')

    } catch (error) {
      console.error('Error completing exercise:', error)
    }
  }

  const handleLogout = async () => {
    const { supabase } = await import('../supabase')
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff8e1' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔄</div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading your personalized experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(255, 248, 225, 0.92), rgba(78, 205, 196, 0.92))',
      backgroundImage: `url(/sideimagehands.jpg), url(/couple-embracing.jpg)`,
      backgroundPosition: 'left center, right center',
      backgroundRepeat: 'no-repeat, no-repeat',
      backgroundSize: '25% auto, 20% auto',
      backgroundAttachment: 'fixed',
      paddingBottom: '100px' // Space for bottom navigation
    }}>
      
      {/* Mobile-Optimized Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 20px 10px 20px',
        maxWidth: '100%'
      }}>
        <img src="/NestMates_App_Icon.png" alt="NestMates" style={{ height: '48px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px 12px', 
            borderRadius: '20px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#1f2937',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            Hi, {profile?.first_name || 'there'}! 👋
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              color: '#ef4444', 
              fontSize: '24px', 
              background: 'white',
              border: 'none', 
              cursor: 'pointer',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            🚪
          </button>
        </div>
      </div>

      {/* Mobile-First Layout */}
      <div style={{ 
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '100%'
      }}>
        
        {/* Today's Highlights - Stacked on Mobile */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          
          {/* Perfect Date Tonight */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            padding: '24px', 
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px', marginRight: '10px' }}>🌟</div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Perfect Date Tonight</h2>
            </div>

            {generatingDate ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>✨</div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Finding perfect dates...</p>
                <div style={{ width: '24px', height: '24px', border: '3px solid #fed7aa', borderTop: '3px solid #f97316', borderRadius: '50%', margin: '12px auto', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : dateRecommendations?.primaryDate ? (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f97316', marginBottom: '10px' }}>{dateRecommendations.primaryDate.title}</h3>
                
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.4', marginBottom: '12px' }}>
                  {dateRecommendations.primaryDate.description}
                </p>

                <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', marginBottom: '6px' }}>Timeline:</h4>
                  {dateRecommendations.primaryDate.timeline?.map((time, index) => (
                    <div key={index} style={{ color: '#0369a1', fontSize: '12px', marginBottom: '3px' }}>• {time}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>
                    {dateRecommendations.primaryDate.totalCost}
                  </span>
                  <button 
                    onClick={() => generateDateRecommendations(profile)}
                    style={{ 
                      fontSize: '11px', 
                      color: '#f97316', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      padding: '4px 8px'
                    }}
                  >
                    Get new ideas
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading recommendations...</p>
              </div>
            )}
          </div>

          {/* Today's AI Insight */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            padding: '24px', 
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px', marginRight: '10px' }}>🧠</div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Today's Insight</h2>
            </div>

            {generatingInsight ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>✨</div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Creating your insight...</p>
                <div style={{ width: '24px', height: '24px', border: '3px solid #fed7aa', borderTop: '3px solid #f97316', borderRadius: '50%', margin: '12px auto', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : todayInsight ? (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f97316', marginBottom: '10px' }}>{todayInsight.title}</h3>
                
                <div style={{ color: '#374151', lineHeight: '1.4', marginBottom: '12px', fontSize: '14px' }}>
                  <p style={{ marginBottom: '8px' }}>
                    {todayInsight.content.split('\n')[0]}
                  </p>
                </div>

                <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '6px' }}>Today's Challenge:</h4>
                  <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>{todayInsight.exercise}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ color: '#6b7280', fontSize: '10px' }}>{todayInsight.psychology_source}</small>
                  
                  {!todayInsight.completed ? (
                    <button 
                      onClick={completeExercise}
                      style={{ 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: 'none', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        cursor: 'pointer' 
                      }}
                    >
                      Complete (+50)
                    </button>
                  ) : (
                    <div style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>✅ Done!</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Partner Connection - Full Width on Mobile */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          padding: '24px', 
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '20px', marginRight: '10px' }}>💕</div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Partner Connection</h2>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '6px' }}>Your Partner Code</h3>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f97316', marginBottom: '6px' }}>NEST-{user?.id.slice(-4).toUpperCase()}</div>
              <p style={{ color: '#92400e', fontSize: '11px' }}>Share this with your partner</p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter partner's code"
                value={partnerInput}
                onChange={(e) => setPartnerInput(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: '14px'
                }}
              />
              <button 
                style={{ 
                  backgroundColor: '#f97316', 
                  color: 'white', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '16px', 
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>
              {todayInsight?.completed ? '50' : '0'}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Coins Today</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '16px', 
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>7</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Day Streak</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '16px', 
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>12</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Insights Read</div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="dashboard" />
    </div>
  )
}
