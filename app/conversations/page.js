'use client'
import { useState, useEffect } from 'react'

export default function ConversationsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('reconnection')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  const categories = [
    { id: 'reconnection', label: 'Reconnection', icon: '💕', desc: 'Rediscover each other' },
    { id: 'dreams', label: 'Dreams & Goals', icon: '✨', desc: 'Future aspirations' },
    { id: 'memories', label: 'Sweet Memories', icon: '💭', desc: 'Cherish the past' },
    { id: 'intimacy', label: 'Deeper Connection', icon: '💖', desc: 'Emotional closeness' },
    { id: 'fun', label: 'Playful & Light', icon: '😄', desc: 'Laughter together' },
    { id: 'future', label: 'Our Future', icon: '🚀', desc: 'What comes next' }
  ]

  const difficulties = [
    { id: 'light', label: 'Light & Easy', desc: 'Comfortable topics' },
    { id: 'medium', label: 'Meaningful', desc: 'Thought-provoking' },
    { id: 'deep', label: 'Deep & Personal', desc: 'Vulnerable sharing' }
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    if (user && profile) {
      loadConversations()
    }
  }, [selectedCategory, user, profile])

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
      }

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/generate-conversations?userId=${user.id}&category=${selectedCategory}`)
      const data = await response.json()

      if (data.success && data.conversations) {
        setConversations(data.conversations)
      } else {
        // Generate new conversations if none exist for today
        await generateConversations()
      }

    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const generateConversations = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate-conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userPreferences: {
            city: profile.location_city,
            state: profile.location_state,
            interests: profile.interests,
            budget: profile.budget
          },
          category: selectedCategory,
          difficulty: selectedDifficulty
        })
      })

      const data = await response.json()

      if (data.success) {
        setConversations(data.conversations)
      }

    } catch (error) {
      console.error('Error generating conversations:', error)
    } finally {
      setGenerating(false)
    }
  }

  const markQuestionUsed = async (questionIndex) => {
    if (!conversations?.saved?.id) return

    try {
      await fetch('/api/generate-conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversations.saved.id,
          questionIndex: questionIndex
        })
      })
    } catch (error) {
      console.error('Error marking question as used:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff8e1' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading conversation starters...</p>
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Conversation Starters</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Category Selection */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>Choose Your Conversation Topic</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedCategory === category.id ? '#f97316' : '#e5e7eb'}`,
                  backgroundColor: selectedCategory === category.id ? '#fed7aa' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{category.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{category.label}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{category.desc}</div>
              </button>
            ))}
          </div>

          {/* Difficulty Selection */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Conversation Depth</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {difficulties.map(difficulty => (
                <button
                  key={difficulty.id}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedDifficulty === difficulty.id ? '#f97316' : '#e5e7eb'}`,
                    backgroundColor: selectedDifficulty === difficulty.id ? '#fed7aa' : 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={generateConversations}
            disabled={generating}
            style={{ 
              marginTop: '20px',
              backgroundColor: '#f97316', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              fontSize: '16px', 
              fontWeight: '600', 
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1
            }}
          >
            {generating ? 'Creating Questions...' : 'Generate New Questions'}
          </button>
        </div>

        {/* Questions Display */}
        {generating ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>Creating Perfect Questions...</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Personalizing conversation starters just for you</p>
            <div style={{ width: '40px', height: '40px', border: '4px solid #fed7aa', borderTop: '4px solid #f97316', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : conversations?.questions ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '24px', marginRight: '12px' }}>
                {categories.find(c => c.id === selectedCategory)?.icon}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {categories.find(c => c.id === selectedCategory)?.label} Questions
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {conversations.questions.map((q, index) => (
                <div key={index} style={{ 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  backgroundColor: expandedQuestion === index ? '#fef3c7' : 'white'
                }}>
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                    style={{
                      width: '100%',
                      padding: '20px',
                      textAlign: 'left',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>"{q.question}"</span>
                      <span style={{ fontSize: '20px', transform: expandedQuestion === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ↓
                      </span>
                    </div>
                  </button>

                  {expandedQuestion === index && (
                    <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #e5e7eb' }}>
                      {q.followUp && (
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', fontStyle: 'italic' }}>
                          Follow-up: {q.followUp}
                        </p>
                      )}
                      <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '15px' }}>
                        💡 {q.explanation}
                      </p>
                      <button
                        onClick={() => markQuestionUsed(index)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ We Discussed This
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '25px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>💡 Pro Tip</h3>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                Save these questions in your phone and bring them to dinner tonight. Take turns asking each other and really listen to the answers!
              </p>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>Ready for Great Conversations?</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Click "Generate New Questions" to get personalized conversation starters!</p>
          </div>
        )}
      </div>
    </div>
  )
}
