'use client'
import { useState, useEffect } from 'react'

export default function ProgressPage() {
  const [user, setUser] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)
  const [checkinScores, setCheckinScores] = useState({
    connection: 5,
    communication: 5,
    intimacy: 5,
    activities: 0
  })
  const [checkinNotes, setCheckinNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      // Load progress data
      const response = await fetch(`/api/relationship-checkin?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        setCheckins(data.checkins)
        setMilestones(data.milestones)
      }

    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitCheckin = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/relationship-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          scores: checkinScores,
          notes: checkinNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        // Show milestone celebrations
        if (data.milestones && data.milestones.length > 0) {
          alert(`🎉 ${data.milestones[0].celebration_message}\n+${data.milestones[0].coins_awarded} coins!`)
        } else {
          alert('✅ Check-in saved! Thanks for tracking your progress.')
        }

        setShowCheckin(false)
        loadProgressData() // Refresh data
      }

    } catch (error) {
      console.error('Error submitting check-in:', error)
      alert('Error saving check-in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getAverageScore = () => {
    if (checkins.length === 0) return 0
    const recent = checkins.slice(0, 7) // Last 7 check-ins
    const total = recent.reduce((sum, checkin) => 
      sum + checkin.connection_score + checkin.communication_score + checkin.intimacy_score, 0
    )
    return Math.round(total / (recent.length * 3))
  }

  const getScoreTrend = () => {
    if (checkins.length < 2) return 'neutral'
    const recent = getAverageScore()
    const previous = Math.round((
      checkins[1].connection_score + 
      checkins[1].communication_score + 
      checkins[1].intimacy_score
    ) / 3)
    
    if (recent > previous) return 'up'
    if (recent < previous) return 'down'
    return 'neutral'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff8e1' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading your relationship progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(255, 248, 225, 0.95), rgba(78, 205, 196, 0.95))',
      padding: '20px'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', maxWidth: '1200px', margin: '0 auto 30px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ←
          </button>
          <img src="/NestMates_App_Icon.png" alt="NestMates" style={{ height: '48px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Relationship Progress</h1>
        </div>
        <button 
          onClick={() => setShowCheckin(true)}
          style={{ backgroundColor: '#f97316', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
        >
          Weekly Check-in
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          
          {/* Overall Score */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f97316', marginBottom: '10px' }}>
              {getAverageScore()}
              <span style={{ fontSize: '24px', color: '#6b7280' }}>/10</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>Overall Health</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span style={{ fontSize: '16px' }}>
                {getScoreTrend() === 'up' ? '📈' : getScoreTrend() === 'down' ? '📉' : '➡️'}
              </span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {getScoreTrend() === 'up' ? 'Improving!' : getScoreTrend() === 'down' ? 'Needs attention' : 'Stable'}
              </span>
            </div>
          </div>

          {/* Check-in Streak */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
              {checkins.length}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>Check-ins</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total completed</p>
          </div>

          {/* Milestones */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '10px' }}>
              {milestones.length}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>Milestones</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Achievements unlocked</p>
          </div>

          {/* This Week */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {checkins.length > 0 && new Date(checkins[0].checkin_date).toDateString() === new Date().toDateString() ? '✅' : '⏰'}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>This Week</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {checkins.length > 0 && new Date(checkins[0].checkin_date).toDateString() === new Date().toDateString() 
                ? 'Checked in today!' 
                : 'Ready for check-in'
              }
            </p>
          </div>
        </div>

        {/* Progress Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '25px' }}>Progress Over Time</h2>
          
          {checkins.length > 0 ? (
            <div>
              {/* Simple progress visualization */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {checkins.slice(0, 10).reverse().map((checkin, index) => {
                  const avg = Math.round((checkin.connection_score + checkin.communication_score + checkin.intimacy_score) / 3)
                  const height = (avg / 10) * 100
                  return (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        height: '100px', 
                        display: 'flex', 
                        alignItems: 'end', 
                        justifyContent: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          width: '30px',
                          height: `${height}px`,
                          backgroundColor: avg >= 8 ? '#10b981' : avg >= 6 ? '#f59e0b' : '#ef4444',
                          borderRadius: '4px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            {avg}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {new Date(checkin.checkin_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Complete your first check-in to see your progress!</p>
            </div>
          )}
        </div>

        {/* Recent Milestones */}
        {milestones.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '25px' }}>Recent Achievements</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {milestones.slice(0, 5).map((milestone, index) => (
                <div key={index} style={{ 
                  backgroundColor: '#fef3c7', 
                  padding: '20px', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{ fontSize: '32px' }}>🏆</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '5px' }}>
                      {milestone.celebration_message}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                      {new Date(milestone.achieved_date).toLocaleDateString()} • +{milestone.coins_awarded} coins
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckin && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '30px', 
            width: '90%', 
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>Weekly Relationship Check-in</h2>
            
            {/* Connection Score */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                How connected did you feel this week? ({checkinScores.connection}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={checkinScores.connection}
                onChange={(e) => setCheckinScores(prev => ({ ...prev, connection: parseInt(e.target.value) }))}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                <span>Distant</span>
                <span>Very Connected</span>
              </div>
            </div>

            {/* Communication Score */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                How was your communication? ({checkinScores.communication}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={checkinScores.communication}
                onChange={(e) => setCheckinScores(prev => ({ ...prev, communication: parseInt(e.target.value) }))}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Intimacy Score */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                How was your intimacy & closeness? ({checkinScores.intimacy}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={checkinScores.intimacy}
                onChange={(e) => setCheckinScores(prev => ({ ...prev, intimacy: parseInt(e.target.value) }))}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                <span>Distant</span>
                <span>Very Close</span>
              </div>
            </div>

            {/* Activities */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                How many activities did you do together this week?
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={checkinScores.activities}
                onChange={(e) => setCheckinScores(prev => ({ ...prev, activities: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                placeholder="0"
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                Any notes about this week? (Optional)
              </label>
              <textarea
                value={checkinNotes}
                onChange={(e) => setCheckinNotes(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', minHeight: '80px', resize: 'vertical' }}
                placeholder="How are you feeling about your relationship? Any highlights or challenges?"
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setShowCheckin(false)}
                style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={submitCheckin}
                disabled={submitting}
                style={{ flex: 2, backgroundColor: '#f97316', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Saving...' : 'Save Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
