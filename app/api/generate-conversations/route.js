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
  const [error, setError] = useState('')

  const categories = [
    { id: 'reconnection', label: 'Reconnection', icon: '💕', desc: 'Rediscover each other' },
    { id: 'dreams', label: 'Dreams & Goals', icon: '✨', desc: 'Future aspirations' },
    { id: 'memories', label: 'Sweet Memories', icon: '💭', desc: 'Cherish the past' },
    { id: 'intimacy', label: 'Deeper Connection', icon: '💖', desc: 'Emotional closeness' },
    { id: 'fun', label: 'Playful & Light', icon: '😄', desc: 'Laughter together' },
    { id: 'future', label: 'Our Future', icon: '🚀', desc: 'What comes next' }
  ]

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
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const generateConversations = async () => {
    if (!user || !profile) {
      setError('Missing user information')
      return
    }

    setGenerating(true)
    setError('')
    
    try {
      console.log('Starting conversation generation...')
      console.log('User ID:', user.id)
      console.log('Category:', selectedCategory)
      console.log('Profile:', profile)

      const requestBody = {
        userId: user.id,
        userPreferences: {
          city: profile.location_city || 'Unknown',
          state: profile.location_state || 'Unknown',
          interests: profile.interests || 'general',
          budget: profile.budget || 'moderate'
        },
        category: selectedCategory,
        difficulty: selectedDifficulty
      }

      console.log('Request body:', requestBody)

      const response = await fetch('/api/generate-conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.success && data.conversations) {
        setConversations(data.conversations)
        console.log('Conversations set successfully')
      } else {
        throw new Error('No conversation data received')
      }

    } catch (error) {
      console.error('Generation error:', error)
      setError(`Failed to generate conversations: ${error.message}`)
    } finally {
      setGenerating(false)
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
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Conversation Depth</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['light', 'medium', 'deep'].map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedDifficulty === difficulty ? '#f97316' : '#e5e7eb'}`,
                    backgroundColor: selectedDifficulty === difficulty ? '#fed7aa' : 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1f2937',
                    textTransform: 'capitalize'
                  }}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={generateConversations}
            disabled={generating}
            style={{ 
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

          {error && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
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
              <div style={{ fontSize: '32px', marginRight: '15px' }}>
                {categories.find(c => c.id === selectedCategory)?.icon}
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {categories.find(c => c.id === selectedCategory)?.label} Questions
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '25px' }}>
              {conversations.questions.map((q, index) => (
                <div key={index} style={{ 
                  background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                  border: '2px solid #f97316', 
                  borderRadius: '16px', 
                  padding: '25px',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.1)'
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#92400e', marginBottom: '15px', lineHeight: '1.4' }}>
                    💭 "{q.question}"
                  </h3>
                  
                  {q.followUp && (
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                      <p style={{ fontSize: '15px', color: '#92400e', margin: 0, fontStyle: 'italic' }}>
                        <strong>Follow-up:</strong> {q.followUp}
                      </p>
                    </div>
                  )}
                  
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                      💡 <strong>Why this helps:</strong> {q.explanation}
                    </p>
                  </div>
                  
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    ✅ We Discussed This (+25 coins)
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', padding: '20px', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e40af', marginBottom: '10px' }}>🌟 Pro Tip</h3>
              <p style={{ fontSize: '15px', color: '#1e40af', margin: 0 }}>
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
