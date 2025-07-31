'use client'
import { useState, useEffect } from 'react'

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
      padding: '20px'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', maxWidth: '1400px', margin: '0 auto 30px auto' }}>
        <img src="/NestMates_App_Icon.png" alt="NestMates" style={{ height: '56px' }} />
        <div style={{ display: 'flex', gap: '15px' }}>
          <span style={{ color: '#1f2937', fontSize: '16px', fontWeight: '500' }}>Welcome, {profile?.first_name || user?.email}</span>
          <button 
            onClick={handleLogout}
            style={{ color: '#ef4444', fontSize: '16px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Three Column Layout */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
        
        {/* Perfect Date Tonight */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>🌟</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Perfect Date Tonight</h2>
          </div>

          {generatingDate ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Finding perfect local dates...</p>
              <div style={{ width: '30px', height: '30px', border: '3px solid #fed7aa', borderTop: '3px solid #f97316', borderRadius: '50%', margin: '15px auto', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : dateRecommendations?.primaryDate ? (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f97316', marginBottom: '12px' }}>{dateRecommendations.primaryDate.title}</h3>
              
              <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5', marginBottom: '15px' }}>
                {dateRecommendations.primaryDate.description}
              </p>

              <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>Tonight's Timeline:</h4>
                {dateRecommendations.primaryDate.timeline?.map((time, index) => (
                  <div key={index} style={{ color: '#0369a1', fontSize: '13px', marginBottom: '4px' }}>• {time}</div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                  Cost: {dateRecommendations.primaryDate.totalCost}
                </span>
                <button 
                  onClick={() => generateDateRecommendations(profile)}
                  style={{ fontSize: '12px', color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Get new ideas
                </button>
              </div>

              {dateRecommendations.primaryDate.venues?.map((venue, index) => (
                <div key={index} style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>{venue.name}</div>
                  <div style={{ fontSize: '12px', color: '#92400e' }}>{venue.activity}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading date recommendations...</p>
            </div>
          )}
        </div>

        {/* Today's AI Insight */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>🧠</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Today's Insight</h2>
          </div>

          {generatingInsight ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Creating your insight...</p>
              <div style={{ width: '30px', height: '30px', border: '3px solid #fed7aa', borderTop: '3px solid #f97316', borderRadius: '50%', margin: '15px auto', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : todayInsight ? (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f97316', marginBottom: '12px' }}>{todayInsight.title}</h3>
              
              <div style={{ color: '#374151', lineHeight: '1.5', marginBottom: '15px', fontSize: '14px' }}>
                {todayInsight.content.split('\n').slice(0, 2).map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '10px' }}>{paragraph}</p>
                ))}
              </div>

              <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>Today's Challenge:</h4>
                <p style={{ color: '#92400e', fontSize: '13px', margin: 0 }}>{todayInsight.exercise}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: '#6b7280', fontSize: '11px' }}>{todayInsight.psychology_source}</small>
                
                {!todayInsight.completed ? (
                  <button 
                    onClick={completeExercise}
                    style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Complete (+50 coins)
                  </button>
                ) : (
                  <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>✅ Done! +50</div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Partner Connection */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>💕</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Partner Connection</h2>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '18px', borderRadius: '12px', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>Your Partner Code</h3>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316', marginBottom: '8px' }}>NEST-{user?.id.slice(-4).toUpperCase()}</div>
              <p style={{ color: '#92400e', fontSize: '12px' }}>Share this with your partner</p>
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter partner's code"
                value={partnerInput}
                onChange={(e) => setPartnerInput(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', marginBottom: '10px' }}
              />
              <button 
                style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Connect Partner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ maxWidth: '1400px', margin: '25px auto 0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
        <button style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📍</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>More Local Ideas</div>
        </button>
        
        <button style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Progress</div>
        </button>
        
        <button style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Upgrade to Premium</div>
        </button>
        
        <button style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚙️</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Settings</div>
        </button>
      </div>
    </div>
  )
}
