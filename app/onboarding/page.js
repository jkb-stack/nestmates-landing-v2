'use client'
import { useState, useEffect } from 'react'

export default function OnboardingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    interests: [],
    budget: '',
    partnerCode: '',
    hasPartner: false
  })

  const interests = [
    { id: 'dining', label: '🍽️ Dining Out', desc: 'Restaurants, cafes, food experiences' },
    { id: 'outdoors', label: '🌳 Outdoor Activities', desc: 'Hiking, parks, nature walks' },
    { id: 'culture', label: '🎭 Arts & Culture', desc: 'Museums, theater, concerts' },
    { id: 'fitness', label: '💪 Active & Fitness', desc: 'Yoga, dancing, sports' },
    { id: 'learning', label: '📚 Learning Together', desc: 'Classes, workshops, seminars' },
    { id: 'entertainment', label: '🎬 Entertainment', desc: 'Movies, comedy shows, events' }
  ]

  const budgetOptions = [
    { id: 'budget', label: '💰 Budget-Friendly', desc: 'Under $50 per activity' },
    { id: 'moderate', label: '💳 Moderate', desc: '$50-150 per activity' },
    { id: 'premium', label: '💎 Premium', desc: '$150+ per activity' }
  ]

  useEffect(() => {
    async function checkUser() {
      try {
        const { supabase } = await import('../supabase')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          window.location.href = '/login'
          return
        }
        
        setUser(user)
      } catch (err) {
        console.error('Error getting user:', err)
        window.location.href = '/login'
      }
      
      setLoading(false)
    }
    
    checkUser()
  }, [])

  const handleInterestToggle = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const handleComplete = async () => {
    try {
      const { supabase } = await import('../supabase')
      
      // Save user preferences to database
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          city: formData.city,
          state: formData.state,
          interests: formData.interests,
          budget: formData.budget,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving profile:', error)
        alert('Error saving profile. Please try again.')
        return
      }

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Error completing onboarding:', err)
      alert('Error completing setup. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff7ed 0%, #f0fdfa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #ea580c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Setting up your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, rgba(255, 247, 237, 0.92) 0%, rgba(240, 253, 250, 0.92) 100%),
        url('/sideimagehands.jpg'),
        url('/couple-embracing.jpg')
      `,
      backgroundSize: 'cover, 25%, 20%',
      backgroundPosition: 'center, left center, right center',
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
      backgroundAttachment: 'fixed, fixed, fixed',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/NestMates_App_Icon.png" 
            alt="NestMates" 
            style={{ height: '60px', width: 'auto', marginBottom: '1rem' }}
          />
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: '0 0 0.5rem 0'
          }}>
            Welcome to NestMates!
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Let's personalize your relationship journey
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          backgroundColor: '#f3f4f6',
          height: '8px',
          borderRadius: '4px',
          marginBottom: '2rem',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#ea580c',
            height: '100%',
            width: `${(step / 3) * 100}%`,
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              📍 Where are you located?
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              We'll use this to find amazing local activities for you and your partner.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Dallas"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="TX"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.city || !formData.state}
              style={{
                width: '100%',
                backgroundColor: formData.city && formData.state ? '#ea580c' : '#9ca3af',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: formData.city && formData.state ? 'pointer' : 'not-allowed'
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              ❤️ What do you enjoy together?
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Select your shared interests (choose 2-4 for best recommendations).
            </p>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {interests.map(interest => (
                <div
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  style={{
                    padding: '1rem',
                    border: `2px solid ${formData.interests.includes(interest.id) ? '#ea580c' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: formData.interests.includes(interest.id) ? '#fff7ed' : 'white'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                    {interest.label}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {interest.desc}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={formData.interests.length === 0}
                style={{
                  flex: 2,
                  backgroundColor: formData.interests.length > 0 ? '#ea580c' : '#9ca3af',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: formData.interests.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Complete */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              💰 What's your activity budget?
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              This helps us recommend activities that fit your comfort level.
            </p>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {budgetOptions.map(budget => (
                <div
                  key={budget.id}
                  onClick={() => setFormData(prev => ({ ...prev, budget: budget.id }))}
                  style={{
                    padding: '1rem',
                    border: `2px solid ${formData.budget === budget.id ? '#ea580c' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: formData.budget === budget.id ? '#fff7ed' : 'white'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                    {budget.label}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {budget.desc}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!formData.budget}
                style={{
                  flex: 2,
                  backgroundColor: formData.budget ? '#ea580c' : '#9ca3af',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: formData.budget ? 'pointer' : 'not-allowed'
                }}
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
