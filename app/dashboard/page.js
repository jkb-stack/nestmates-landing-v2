'use client'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [todayInsight, setTodayInsight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingInsight, setGeneratingInsight] = useState(false)
  const [partnerCode, setPartnerCode] = useState('')
  const [partnerInput, setPartnerInput] = useState('')

  useEffect(() => {
    loadUserAndInsight()
  }, [])

  const loadUserAndInsight = async () => {
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
      }

      // Get today's insight
      const today = new Date().toISOString().split('T')[0]
      const { data: insightData } = await supabase
        .from('daily_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_date', today)
        .single()

      if (insightData) {
        setTodayInsight(insightData)
      } else {
        // Generate today's insight
        await generateTodayInsight(user.id, profileData)
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
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

  const completeExercise = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      await supabase
        .from('daily_insights')
        .update({ completed: true })
        .eq('id', todayInsight.id)

      setTodayInsight(prev => ({ ...prev, completed: true }))
      
      // Could add coins to user profile here
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
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading your personalized insights...</p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', maxWidth: '1200px', margin: '0 auto 30px auto' }}>
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Today's AI Insight */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>🧠</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Today's Relationship Insight</h2>
          </div>

          {generatingInsight ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Creating your personalized insight...</p>
              <div style={{ width: '40px', height: '40px', border: '4px solid #fed7aa', borderTop: '4px solid #f97316', borderRadius: '50%', margin: '20px auto', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : todayInsight ? (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#f97316', marginBottom: '15px' }}>{todayInsight.title}</h3>
              
              <div style={{ color: '#374151', lineHeight: '1.6', marginBottom: '20px', fontSize: '16px' }}>
                {todayInsight.content.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '12px' }}>{paragraph}</p>
                ))}
              </div>

              <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '10px' }}>Today's Challenge:</h4>
                <p style={{ color: '#92400e', fontSize: '15px', margin: 0 }}>{todayInsight.exercise}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: '#6b7280', fontSize: '12px' }}>Based on: {todayInsight.psychology_source}</small>
                
                {!todayInsight.completed ? (
                  <button 
                    onClick={completeExercise}
                    style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Complete Challenge (+50 coins)
                  </button>
                ) : (
                  <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>✅ Completed! +50 coins</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b7280' }}>No insight available. Please try refreshing the page.</p>
            </div>
          )}
        </div>

        {/* Partner Connection */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>💕</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Partner Connection</h2>
          </div>

          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '10px' }}>Your Partner Code</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316', marginBottom: '10px' }}>NEST-{user?.id.slice(-4).toUpperCase()}</div>
              <p style={{ color: '#92400e', fontSize: '14px' }}>Share this code with your partner</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Enter your partner's code"
                value={partnerInput}
                onChange={(e) => setPartnerInput(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', marginBottom: '10px' }}
              />
              <button 
                style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Connect with Partner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ maxWidth: '1200px', margin: '30px auto 0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <button style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎯</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Local Activities</div>
        </button>
        
        <button style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Progress Tracking</div>
        </button>
        
        <button style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚙️</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Settings</div>
        </button>
      </div>
    </div>
  )
}
