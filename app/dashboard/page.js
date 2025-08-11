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
  const [showDateCustomizer, setShowDateCustomizer] = useState(false)

  // Date customization state
  const [datePreferences, setDatePreferences] = useState({
    vibe: 'romantic',
    budget: 100,
    distance: 20,
    timeOfDay: 'evening',
    duration: 'half-day',
    setting: 'either',
    occasion: 'just-because'
  })

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

  const generateTodayInsight = async (userId, userProfile, forceNew = false) => {
    setGeneratingInsight(true)
    try {
      const { supabase } = await import('../supabase')

      console.log('Generating new insight, forceNew:', forceNew)

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
          },
          forceNew: forceNew
        })
      })

      console.log('Insight API response status:', response.status)
      const aiInsight = await response.json()
      console.log('Insight API response:', aiInsight)

      if (aiInsight.error) {
        throw new Error(aiInsight.error)
      }

      // Save to database
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_insights')
        .upsert({
          user_id: userId,
          insight_date: today,
          title: aiInsight.title,
          content: aiInsight.content,
          exercise: aiInsight.exercise,
          psychology_source: aiInsight.psychology_source,
          coins_awarded: 50,
          completed: false
        }, {
          onConflict: 'user_id,insight_date'
        })
        .select()
        .single()

      if (error) throw error

      setTodayInsight(data)
      console.log('Successfully set new insight:', data)

    } catch (error) {
      console.error('Error generating insight:', error)
    } finally {
      setGeneratingInsight(false)
    }
  }

  const generateDateRecommendations = async (userProfile, customPrefs = null) => {
    setGeneratingDate(true)
    try {
      console.log('Generating date recommendations with preferences:', customPrefs)
      
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
          },
          customPreferences: customPrefs
        })
      })

      console.log('Date API response status:', response.status)
      const dateData = await response.json()
      console.log('Date API response:', dateData)

      if (dateData.error) {
        throw new Error(dateData.error)
      }

      setDateRecommendations(dateData.recommendations)
      console.log('Setting date recommendations:', dateData.recommendations)

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

  const handleCustomDateGeneration = () => {
    setShowDateCustomizer(false)
    generateDateRecommendations(profile, datePreferences)
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
    <>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, rgba(255, 248, 225, 0.92), rgba(78, 205, 196, 0.92))',
        backgroundImage: `url(/sideimagehands.jpg), url(/couple-embracing.jpg)`,
        backgroundPosition: 'left center, right center',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundSize: '25% auto, 20% auto',
        backgroundAttachment: 'fixed',
        padding: '20px 20px 100px 20px'
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
          
          {/* Perfect Date Tonight */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '24px', marginRight: '12px' }}>🌟</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Perfect Date Tonight</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setShowDateCustomizer(true)}
                  style={{ 
                    backgroundColor: '#f97316', 
                    color: 'white', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    border: 'none', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}
                >
                  Customize
                </button>
                <button 
                  onClick={() => generateDateRecommendations(profile)}
                  style={{ 
                    backgroundColor: '#e5e7eb', 
                    color: '#6b7280', 
                    padding: '6px 8px', 
                    borderRadius: '6px', 
                    border: 'none', 
                    fontSize: '12px', 
                    cursor: 'pointer' 
                  }}
                >
                  🔄
                </button>
              </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '24px', marginRight: '12px' }}>🧠</div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Today's Insight</h2>
              </div>
              <button 
                onClick={() => generateTodayInsight(user.id, profile, true)}
                style={{ 
                  backgroundColor: '#e5e7eb', 
                  color: '#6b7280', 
                  padding: '6px 8px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  fontSize: '12px', 
                  cursor: 'pointer' 
                }}
              >
                🔄
              </button>
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

      </div>

      {/* Date Customization Modal */}
      {showDateCustomizer && (
        <>
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0, 0, 0, 0.5)', 
              backdropFilter: 'blur(4px)', 
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowDateCustomizer(false)}
          >
            <div 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '20px', 
                padding: '30px', 
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Customize Your Perfect Date</h2>
                <button 
                  onClick={() => setShowDateCustomizer(false)}
                  style={{ fontSize: '24px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              {/* Date Vibe */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>What's the vibe? ✨</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'romantic', emoji: '🌹', label: 'Romantic & Intimate' },
                    { id: 'adventure', emoji: '🎯', label: 'Adventure & Active' },
                    { id: 'cultural', emoji: '🎨', label: 'Cultural & Learning' },
                    { id: 'cozy', emoji: '🏠', label: 'Cozy & Relaxing' },
                    { id: 'fun', emoji: '🎉', label: 'Fun & Playful' },
                    { id: 'upscale', emoji: '🍷', label: 'Upscale & Sophisticated' }
                  ].map(vibe => (
                    <button
                      key={vibe.id}
                      onClick={() => setDatePreferences(prev => ({ ...prev, vibe: vibe.id }))}
                      style={{
                        padding: '12px',
                        border: `2px solid ${datePreferences.vibe === vibe.id ? '#f97316' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        backgroundColor: datePreferences.vibe === vibe.id ? '#fff7ed' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{vibe.emoji}</div>
                      {vibe.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Budget for tonight 💰</h3>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="25"
                  value={datePreferences.budget}
                  onChange={(e) => setDatePreferences(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                  style={{ width: '100%', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                  <span>Free</span>
                  <span style={{ fontWeight: '600', color: '#f97316' }}>${datePreferences.budget}+</span>
                  <span>$300+</span>
                </div>
              </div>

              {/* Distance */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>How far to travel? 📍</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 10, label: '10 miles' },
                    { value: 20, label: '20 miles' },
                    { value: 30, label: '30 miles' },
                    { value: 50, label: '50+ miles' }
                  ].map(distance => (
                    <button
                      key={distance.value}
                      onClick={() => setDatePreferences(prev => ({ ...prev, distance: distance.value }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `2px solid ${datePreferences.distance === distance.value ? '#f97316' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        backgroundColor: datePreferences.distance === distance.value ? '#fff7ed' : 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {distance.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>When? ⏰</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'morning', emoji: '☀️', label: 'Morning' },
                    { id: 'afternoon', emoji: '🌤️', label: 'Afternoon' },
                    { id: 'evening', emoji: '🌅', label: 'Evening' },
                    { id: 'all-day', emoji: '🌍', label: 'All Day' }
                  ].map(time => (
                    <button
                      key={time.id}
                      onClick={() => setDatePreferences(prev => ({ ...prev, timeOfDay: time.id }))}
                      style={{
                        padding: '12px',
                        border: `2px solid ${datePreferences.timeOfDay === time.id ? '#f97316' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        backgroundColor: datePreferences.timeOfDay === time.id ? '#fff7ed' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{time.emoji}</div>
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>How long? ⏱️</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'quick', label: 'Quick (1-2 hrs)' },
                    { id: 'half-day', label: 'Half Day' },
                    { id: 'full-day', label: 'Full Day' }
                  ].map(duration => (
                    <button
                      key={duration.id}
                      onClick={() => setDatePreferences(prev => ({ ...prev, duration: duration.id }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `2px solid ${datePreferences.duration === duration.id ? '#f97316' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        backgroundColor: datePreferences.duration === duration.id ? '#fff7ed' : 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Indoor or outdoor? 🏠</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'indoor', emoji: '🏠', label: 'Indoor' },
                    { id: 'outdoor', emoji: '🌳', label: 'Outdoor' },
                    { id: 'either', emoji: '🌟', label: 'Either' }
                  ].map(setting => (
                    <button
                      key={setting.id}
                      onClick={() => setDatePreferences(prev => ({ ...prev, setting: setting.id }))}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: `2px solid ${datePreferences.setting === setting.id ? '#f97316' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        backgroundColor: datePreferences.setting === setting.id ? '#fff7ed' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      <div style={{ fontSize: '16px', marginBottom: '4px' }}>{setting.emoji}</div>
                      {setting.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleCustomDateGeneration}
                style={{
                  width: '100%',
                  backgroundColor: '#f97316',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)'
                }}
              >
                ✨ Generate My Perfect Date
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '10px 0',
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#f97316'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏠</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Home</span>
          </button>

          <button 
            onClick={() => window.location.href = '/local-activities'}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📍</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Activities</span>
          </button>

          <button 
            onClick={() => window.location.href = '/conversations'}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>💬</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Chat</span>
          </button>

          <button 
            onClick={() => window.location.href = '/progress'}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Progress</span>
          </button>

          <button 
            onClick={() => window.location.href = '/settings'}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>⚙️</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Settings</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
