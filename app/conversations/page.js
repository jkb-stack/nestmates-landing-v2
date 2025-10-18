'use client'
import { useState, useEffect } from 'react'

export default function ConversationsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [userProgram, setUserProgram] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
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
        
        const { data: programData } = await supabase
          .from('user_program_progress')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        setUserProgram(programData)
        await generateConversations(programData)
      }

    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateConversations = async (programData) => {
    try {
      const response = await fetch('/api/generate-conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProgram: programData
        })
      })

      const data = await response.json()
      setConversations(data.conversations || [])

    } catch (error) {
      console.error('Error generating conversations:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔄</div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, rgba(255, 248, 225, 0.95), rgba(167, 139, 250, 0.15))', padding: '20px 20px 100px 20px' }}>
      
      <div style={{ maxWidth: '800px', margin: '0 auto 30px auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Conversation Starters
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Week {userProgram?.current_week || 1} questions designed for your current journey stage
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {conversations.length > 0 ? conversations.map((conv, index) => (
          <div key={index} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#fef7ff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '12px' }}>
                {conv.category || 'General'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', lineHeight: '1.4', marginBottom: '10px' }}>
                {conv.question}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                {conv.context}
              </p>
            </div>

            <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                💡 WHY THIS MATTERS:
              </div>
              <p style={{ fontSize: '12px', color: '#0c4a6e', margin: 0 }}>
                {conv.why_it_matters}
              </p>
            </div>

            {conv.follow_ups && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                  If the conversation flows, try these:
                </div>
                {conv.follow_ups.map((followUp, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', paddingLeft: '12px', borderLeft: '2px solid #e5e7eb' }}>
                    • {followUp}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '10px', color: '#9ca3af' }}>
              Research: {conv.research_source}
            </div>
          </div>
        )) : (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>Loading conversation starters...</p>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '800px', margin: '25px auto 0 auto', textAlign: 'center' }}>
        <button onClick={() => generateConversations(userProgram)} style={{ backgroundColor: '#7c3aed', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
          🔄 Get Different Questions
        </button>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(0, 0, 0, 0.1)', padding: '12px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
          <button onClick={() => window.location.href = '/dashboard'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🏠</div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Home</span>
          </button>
          <button onClick={() => window.location.href = '/conversations'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed' }}>
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
