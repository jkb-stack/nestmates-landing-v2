'use client'
import { useState, useEffect } from 'react'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    interests: [],
    budget: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)

  // Load Supabase and get user
  useEffect(() => {
    async function loadSupabase() {
      try {
        const { supabase } = await import('../supabase')
        
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          window.location.href = '/login'
          return
        }
        setUser(user)
      } catch (err) {
        console.error('Failed to load Supabase:', err)
        setError('Failed to initialize. Please refresh the page.')
      }
    }
    loadSupabase()
  }, [])

  const interests = [
    { id: 'dining', label: 'Fine Dining & Restaurants' },
    { id: 'outdoors', label: 'Outdoor Activities' },
    { id: 'culture', label: 'Arts & Culture' },
    { id: 'entertainment', label: 'Live Entertainment' },
    { id: 'wellness', label: 'Health & Wellness' },
    { id: 'shopping', label: 'Shopping & Markets' },
    { id: 'travel', label: 'Local Travel & Tours' },
    { id: 'learning', label: 'Classes & Workshops' }
  ]

  const toggleInterest = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const handleNext = () => {
    if (step === 1 && (!formData.city || !formData.state)) {
      setError('Please enter your city and state')
      return
    }
    if (step === 2 && formData.interests.length === 0) {
      setError('Please select at least one interest')
      return
    }
    setError('')
    setStep(step + 1)
  }

  const handleComplete = async () => {
    if (!formData.budget) {
      setError('Please select a budget preference')
      return
    }

    if (!user) {
      setError('User not authenticated. Please log in again.')
      return
    }

    try {
      console.log('Starting save process...')
      console.log('User ID:', user.id)
      console.log('Form data:', formData)

      const { supabase } = await import('../supabase')

      const profileData = {
        id: user.id,
        email: user.email,
        location_city: formData.city,
        location_state: formData.state,
        interests: formData.interests.join(','),
        budget: formData.budget,
        onboarding_completed: true
      }

      console.log('Saving profile data:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)

      if (error) {
        console.error('Database error:', error)
        setError(`Database error: ${error.message}`)
        return
      }

      console.log('Save successful:', data)
      setSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)

    } catch (err) {
      console.error('Catch error:', err)
      setError(`Error: ${err.message}`)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Welcome to NestMates!</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Your profile is complete. Redirecting to your dashboard...</p>
          <div style={{ width: '40px', height: '40px', border: '4px solid #fed7aa', borderTop: '4px solid #f97316', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '16px' }}>Error</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ backgroundColor: '#f97316', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff8e1', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img src="/NestMates_Logo_Tagline.png" alt="NestMates" style={{ height: '80px', marginBottom: '20px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>Let's Get Started!</h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>Tell us about yourselves so we can create perfect recommendations</p>
      </div>

      {/* Progress Bar */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          {[1, 2, 3].map(num => (
            <div 
              key={num}
              style={{ 
                width: '30%', 
                height: '8px', 
                backgroundColor: step >= num ? '#f97316' : '#e5e7eb', 
                borderRadius: '4px' 
              }}
            />
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Step {step} of 3</p>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        {/* Step 1: Location */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>Where are you located?</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>We'll use this to find amazing local activities and events near you.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Dallas"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="TX"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>
            </div>

            <button 
              onClick={handleNext}
              style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
            >
              Next: Tell us your interests
            </button>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>What do you enjoy doing together?</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>Select all that interest you. We'll tailor recommendations to your preferences.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {interests.map(interest => (
                <div
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  style={{
                    padding: '16px',
                    border: `2px solid ${formData.interests.includes(interest.id) ? '#f97316' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.interests.includes(interest.id) ? '#fed7aa' : 'white',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{interest.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setStep(1)}
                style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                style={{ flex: 2, backgroundColor: '#f97316', color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Next: Budget preferences
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>What's your typical date night budget?</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>This helps us recommend activities that fit your comfort zone.</p>
            
            <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
              {[
                { value: 'budget', label: 'Budget-Friendly ($0-50)', desc: 'Parks, free events, casual dining' },
                { value: 'moderate', label: 'Moderate ($50-150)', desc: 'Nice restaurants, shows, activities' },
                { value: 'upscale', label: 'Upscale ($150+)', desc: 'Fine dining, premium experiences' },
                { value: 'flexible', label: 'Flexible', desc: 'I want to see all options' }
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, budget: option.value }))}
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.budget === option.value ? '#f97316' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.budget === option.value ? '#fed7aa' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>{option.label}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{option.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setStep(2)}
                style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                style={{ flex: 2, backgroundColor: '#f97316', color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
