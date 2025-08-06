'use client'
import { useState, useEffect } from 'react'

export default function ConversationsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('reconnection')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  const categories = [
    { 
      id: 'reconnection', 
      label: 'Reconnection', 
      icon: '💕', 
      desc: 'Rediscover each other',
      subtitle: 'Identity & connection after parenting'
    },
    { 
      id: 'dreams', 
      label: 'Dreams & Goals', 
      icon: '✨', 
      desc: 'Future aspirations',
      subtitle: 'Your hopes and ambitions together'
    },
    { 
      id: 'memories', 
      label: 'Sweet Memories', 
      icon: '💭', 
      desc: 'Cherish the past',
      subtitle: 'Your beautiful journey together'
    },
    { 
      id: 'intimacy', 
      label: 'Deeper Connection', 
      icon: '💖', 
      desc: 'Emotional & physical closeness',
      subtitle: 'Rebuilding intimacy and trust'
    },
    { 
      id: 'fun', 
      label: 'Playful & Joy', 
      icon: '😄', 
      desc: 'Laughter & adventure',
      subtitle: 'Bringing fun back into your relationship'
    },
    { 
      id: 'future', 
      label: 'Our Future', 
      icon: '🚀', 
      desc: 'What comes next',
      subtitle: 'Planning your next life chapter'
    }
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
    setConversations(null)
    
    try {
      console.log('Generating advanced conversations...')

      const requestBody = {
        userId: user.id,
        userPreferences: {
          city: profile.location_city || 'Unknown',
          state: profile.location_state || 'Unknown',
          interests: profile.interests || 'general',
          budget: profile.budget || 'moderate'
        },
        category: selectedCategory
      }

      const response = await fetch('/api/generate-conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.success && data.conversations) {
        setConversations(data.conversations)
        setExpandedQuestion(0) // Auto-expand first question
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

  const markQuestionDiscussed = async (questionIndex) => {
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
      
      // Visual feedback
      alert('✅ Great! Marked as discussed. You earned 25 connection coins!')
      
    } catch (error) {
      console.error('Error marking question as discussed:', error)
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>AI Conversation Starters</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Neuroscience Banner */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', marginBottom: '25px', border: '2px solid #f97316' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>🧠</span>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316', margin: 0 }}>Neuroscience-Backed Questions</h2>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Each question is designed by relationship neuropsychologists and backed by brain science research. 
            Questions adapt to your unique profile and avoid repeats from previous sessions.
          </p>
        </div>

        {/* Category Selection */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>Choose Your Conversation Focus</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `3px solid ${selectedCategory === category.id ? '#f97316' : '#e5e7eb'}`,
                  backgroundColor: selectedCategory === category.id ? '#fed7aa' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '28px' }}>{category.icon}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{category.label}</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>{category.desc}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>{category.subtitle}</p>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={generateConversations}
              disabled={generating}
              style={{ 
                backgroundColor: '#f97316', 
                color: 'white', 
                padding: '16px 32px', 
                borderRadius: '12px', 
                border: 'none', 
                fontSize: '18px', 
                fontWeight: '700', 
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
              }}
            >
              {generating ? '🧠 Creating Personalized Questions...' : `✨ Generate ${categories.find(c => c.id === selectedCategory)?.label} Questions`}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626', textAlign: 'center' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Questions Display */}
        {generating ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '50px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧠</div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>Creating Your Personalized Questions...</h3>
            <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '16px' }}>
              Analyzing your profile • Checking neuroscience database • Avoiding previous questions
            </p>
            <div style={{ width: '50px', height: '50px', border: '5px solid #fed7aa', borderTop: '5px solid #f97316', borderRadius: '50%', margin: '0 auto', animation: 'spin 1.5s linear infinite' }}></div>
          </div>
        ) : conversations?.questions ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            
            {/* Results Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', paddingBottom: '20px', borderBottom: '2px solid #f3f4f6' }}>
              <div style={{ fontSize: '32px', marginRight: '15px' }}>
                {categories.find(c => c.id === selectedCategory)?.icon}
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
                  {categories.find(c => c.id === selectedCategory)?.label} Questions
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Personalized for your relationship • Based on neuroscience research
                </p>
              </div>
            </div>

            {/* Neuroscience Backing */}
            {conversations.neuroscience_backing && (
              <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #bfdbfe' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔬</span> The Science Behind These Questions
                </h3>
                <p style={{ fontSize: '14px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>
                  {conversations.neuroscience_backing}
                </p>
              </div>
            )}

            {/* Questions List */}
            <div style={{ display: 'grid', gap: '25px' }}>
              {conversations.questions.map((q, index) => (
                <div key={index} style={{ 
                  background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                  border: '3px solid #f97316', 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(249, 115, 22, 0.15)'
                }}>
                  
                  {/* Question Header */}
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                    style={{
                      width: '100%',
                      padding: '25px',
                      textAlign: 'left',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#92400e', marginBottom: '8px', lineHeight: '1.3' }}>
                          💭 "{q.question}"
                        </h3>
                        <div style={{ fontSize: '12px', color: '#92400e', opacity: 0.8 }}>
                          Click to see the science behind this question →
                        </div>
                      </div>
                      <span style={{ 
                        fontSize: '24px', 
                        color: '#f97316',
                        transform: expandedQuestion === index ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.3s ease'
                      }}>
                        ↓
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedQuestion === index && (
                    <div style={{ padding: '0 25px 25px 25px', borderTop: '2px solid rgba(249, 115, 22, 0.2)' }}>
                      
                      {/* Follow-up Question */}
                      {q.followUp && (
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '18px', borderRadius: '12px', marginBottom: '18px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>💫 Follow-up Question:</h4>
                          <p style={{ fontSize: '16px', color: '#92400e', margin: 0, fontStyle: 'italic', fontWeight: '500' }}>
                            "{q.followUp}"
                          </p>
                        </div>
                      )}

                      {/* Scientific Explanation */}
                      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '18px', borderRadius: '12px', marginBottom: '18px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🧠 The Neuroscience:
                        </h4>
                        <p style={{ fontSize: '14px', color: '#1e40af', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                          {q.scientific_explanation}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6366f1', margin: 0, fontWeight: '500' }}>
                          Research: {q.research_source}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => markQuestionDiscussed(index)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          padding: '14px 24px',
                          borderRadius: '10px',
                          border: 'none',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          width: '100%'
                        }}
                      >
                        ✅ We Discussed This Question (+25 Connection Coins)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pro Tip */}
            <div style={{ textAlign: 'center', marginTop: '30px', padding: '25px', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>🌟 Conversation Tips</h3>
              <p style={{ fontSize: '15px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>
                Save these questions in your phone for dinner tonight. Take turns asking and <strong>really listen</strong> to the answers. 
                The magic happens when you build on each other's responses!
              </p>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '50px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Ready for Meaningful Conversations?</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '16px' }}>
              Select a category above and generate personalized, neuroscience-backed questions!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
