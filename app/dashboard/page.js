'use client'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [userProgram, setUserProgram] = useState(null)
  const [todayInsight, setTodayInsight] = useState(null)
  const [dateActivity, setDateActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        
        if (!profileData.onboarding_completed) {
          window.location.href = '/onboarding'
          return
        }

        await loadOrCreateProgram(user.id, profileData)
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrCreateProgram = async (userId, userProfile) => {
    try {
      const { supabase } = await import('../supabase')
      
      let { data: programData } = await supabase
        .from('user_program_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!programData) {
        const { data: newProgram } = await supabase
          .from('user_program_progress')
          .insert({
            user_id: userId,
            current_day: 1,
            current_week: 1,
            program_start_date: new Date().toISOString(),
            streak: 0,
            last_activity_date: new Date().toISOString()
          })
          .select()
          .single()
        
        programData = newProgram
      }

      setUserProgram(programData)
      await loadTodayContent(userId, userProfile, programData)
      
    } catch (error) {
      console.error('Error loading program:', error)
    }
  }

  const loadTodayContent = async (userId, userProfile, programData) => {
    try {
      const insightResponse = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPreferences: {
            city: userProfile.location_city,
            state: userProfile.location_state,
            interests: userProfile.interests
          },
          userProgram: programData
        })
      })

      const insightData = await insightResponse.json()
      setTodayInsight(insightData)

      const dateResponse = await fetch('/api/generate-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPreferences: {
            city: userProfile.location_city,
            state: userProfile.location_state,
            interests: userProfile.interests
          },
          userProgram: programData
        })
      })

      const dateData = await dateResponse.json()
      setDateActivity(dateData.recommendations?.primaryDate)

    } catch (error) {
      console.error('Error loading content:', error)
    }
  }

  const completeQuickAction = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      const today = new Date().toISOString().split('T')[0]
      const lastActivity = userProgram.last_activity_date ? 
        new Date(userProgram.last_activity_date).toISOString().split('T')[0] : 
        null
      
      const isNewDay = lastActivity !== today
      
      const newStreak = isNewDay ? userProgram.streak + 1 : userProgram.streak
      const newDay = isNewDay ? userProgram.current_day + 1 : userProgram.current_day
      const newWeek = Math.ceil(newDay / 7)
      
      const hitMilestone = newDay % 7 === 0 && isNewDay
      
      await supabase
        .from('user_program_progress')
        .update({
          current_day: newDay,
          current_week: newWeek,
          streak: newStreak,
          last_activity_date: new Date().toISOString(),
          total_insights_completed: (userProgram.total_insights_completed || 0) + 1
        })
        .eq('user_id', user.id)

      if (hitMilestone) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }

      alert(`✅ Great job! Day ${newDay} complete. Streak: ${newStreak} days 🔥`)
      
      window.location.reload()

    } catch (error) {
      console.error('Error completing action:', error)
      alert('Error updating progress. Please try again.')
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
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading your journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, rgba(255, 248, 225, 0.95), rgba(167, 139, 250, 0.15))', padding: '20px 20px 100px 20px' }}>
      
      {showCelebration && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1000, textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '10px' }}>
            Week {userProgram?.current_week} Complete!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>New insights unlocked for next week</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', maxWidth: '1400px', margin: '0 auto 30px auto' }}>
        <img src="/NestMates_App_Icon.png" alt="NestMates" style={{ height: '56px' }} />
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔥</span>
            <span style={{ fontWeight: 'bold', color: '#f97316' }}>{userProgram?.streak || 0}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>day streak</span>
          </div>
          <span style={{ color: '#1f2937', fontSize: '16px', fontWeight: '500' }}>
            {profile?.first_name || user?.email?.split('@')[0]}
          </span>
          <button onClick={handleLogout} style={{ color: '#ef4444', fontSize: '16px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto 30px auto', backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed', margin: 0 }}>
              Week {userProgram?.current_week || 1} • Day {userProgram?.current_day || 1} of 112
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {userProgram?.current_week <= 4 ? "Acknowledging the Transition" : 
               userProgram?.current_week <= 8 ? "Processing Grief & Loss" :
               userProgram?.current_week <= 12 ? "Rediscovering Identity" : "Rebuilding Connection"}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
              {Math.round((userProgram?.current_day || 1) / 112 * 100)}%
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Complete</div>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#f3f4f6', borderRadius: '10px', height: '8px' }}>
          <div style={{ backgroundColor: '#7c3aed', borderRadius: '10px', height: '100%', width: `${(userProgram?.current_day || 1) / 112 * 100}%`, transition: 'width 0.5s ease' }}></div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
        
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: '24px', marginRight: '12px' }}>💡</div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Today's Insight</h2>
            </div>
            <div style={{ backgroundColor: '#fef3c7', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: '#92400e' }}>
              Day {userProgram?.current_day || 1}
            </div>
          </div>

          {todayInsight ? (
            <div>
              {todayInsight.hook && (
                <div style={{ backgroundColor: '#fef7ff', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: '2px solid #e9d5ff' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#7c3aed', margin: 0, fontStyle: 'italic' }}>
                    "{todayInsight.hook}"
                  </p>
                </div>
              )}

              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                {todayInsight.title}
              </h3>
              
              <div style={{ color: '#374151', lineHeight: '1.6', marginBottom: '15px', fontSize: '14px' }}>
                {todayInsight.content}
              </div>

              {todayInsight.interesting_fact && (
                <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                    💡 DID YOU KNOW?
                  </div>
                  <p style={{ fontSize: '12px', color: '#0c4a6e', margin: 0 }}>
                    {todayInsight.interesting_fact}
                  </p>
                </div>
              )}

              <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  ⚡ Today's Quick Action:
                </h4>
                <p style={{ color: '#92400e', fontSize: '13px', margin: '0 0 12px 0' }}>
                  {todayInsight.quick_action || todayInsight.exercise}
                </p>
                <button onClick={completeQuickAction} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  ✓ Mark Complete
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: '#9ca3af', fontSize: '10px' }}>
                  {todayInsight.research_credit || todayInsight.psychology_source || 'Research-based'}
                </small>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading today's insight...</p>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>💑</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>This Week's Activity</h2>
          </div>

          {dateActivity ? (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f97316', marginBottom: '12px' }}>
                {dateActivity.title}
              </h3>
              
              <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5', marginBottom: '15px' }}>
                {dateActivity.description}
              </p>

              {dateActivity.timeline && (
                <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
                    Activity Flow:
                  </h4>
                  {dateActivity.timeline.map((step, index) => (
                    <div key={index} style={{ color: '#0369a1', fontSize: '12px', marginBottom: '4px' }}>
                      • {step}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => window.location.href = '/conversations'} style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                See More Activities
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading activity...</p>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>🤝</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Support</h2>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#15803d', marginBottom: '4px' }}>
              2,847
            </div>
            <div style={{ fontSize: '12px', color: '#15803d' }}>
              people using NestMates today
            </div>
          </div>

          <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
              📅 Coming Up:
            </div>
            <div style={{ fontSize: '12px', color: '#92400e' }}>
              {userProgram?.current_day % 7 === 0 ? 
                `Week ${(userProgram?.current_week || 0) + 1} starts tomorrow!` :
                `${7 - (userProgram?.current_day % 7)} days until Week ${(userProgram?.current_week || 0) + 1}`
              }
            </div>
          </div>

          <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
              📞 Need Help?
            </div>
            <p style={{ fontSize: '11px', color: '#991b1b', marginBottom: 0 }}>
              Educational content only. Not professional counseling.
            </p>
          </div>
        </div>

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(0, 0, 0, 0.1)', padding: '12px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
          <button onClick={() => window.location.href = '/dashboard'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🏠</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Home</span>
          </button>
          <button onClick={() => window.location.href = '/conversations'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>💬</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Chat</span>
          </button>
          <button onClick={() => window.location.href = '/progress'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>📊</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Progress</span>
          </button>
          <button onClick={() => window.location.href = '/settings'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>⚙️</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}
