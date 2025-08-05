'use client'
import { useState, useEffect } from 'react'

export default function LocalActivitiesPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [selectedDistance, setSelectedDistance] = useState('25')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', label: 'All Activities', icon: '🎯' },
    { id: 'dining', label: 'Restaurants', icon: '🍽️' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { id: 'outdoors', label: 'Outdoor Fun', icon: '🌳' },
    { id: 'culture', label: 'Arts & Culture', icon: '🎨' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'nightlife', label: 'Evening Out', icon: '🌙' }
  ]

  const budgetOptions = [
    { id: 'all', label: 'Any Budget' },
    { id: 'free', label: 'Free ($0)' },
    { id: 'budget', label: 'Budget ($-$$)' },
    { id: 'moderate', label: 'Moderate ($$-$$$)' },
    { id: 'upscale', label: 'Upscale ($$$+)' }
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    if (user && profile) {
      searchActivities()
    }
  }, [selectedCategory, selectedBudget, selectedDistance, user, profile])

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

  const searchActivities = async () => {
    if (!profile) return

    setSearching(true)
    try {
      const response = await fetch('/api/search-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: `${profile.location_city}, ${profile.location_state}`,
          category: selectedCategory,
          budget: selectedBudget,
          radius: selectedDistance,
          searchTerm: searchTerm
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setActivities(data.activities || [])
      }

    } catch (error) {
      console.error('Error searching activities:', error)
      // Fallback with sample data
      setActivities(generateSampleActivities())
    } finally {
      setSearching(false)
    }
  }

  const generateSampleActivities = () => {
    const sampleActivities = [
      {
        name: "Meridian Restaurant",
        category: "dining",
        description: "Upscale farm-to-table dining with romantic ambiance",
        rating: 4.8,
        priceLevel: "$$$",
        address: "123 Main St",
        phone: "(555) 123-4567",
        hours: "5:00 PM - 10:00 PM",
        image: "🍽️",
        features: ["Romantic", "Wine Bar", "Outdoor Seating"]
      },
      {
        name: "Riverside Walking Trail",
        category: "outdoors",
        description: "Beautiful 3-mile trail perfect for evening walks",
        rating: 4.6,
        priceLevel: "Free",
        address: "Riverside Park",
        phone: "",
        hours: "Dawn to Dusk",
        image: "🌳",
        features: ["Scenic Views", "Easy Walk", "Pet Friendly"]
      },
      {
        name: "Downtown Art Gallery",
        category: "culture",
        description: "Local artists showcase with monthly rotating exhibits",
        rating: 4.4,
        priceLevel: "$",
        address: "456 Art District",
        phone: "(555) 234-5678",
        hours: "10:00 AM - 6:00 PM",
        image: "🎨",
        features: ["Local Art", "Wine & Cheese", "Guided Tours"]
      },
      {
        name: "Blue Note Jazz Lounge",
        category: "entertainment",
        description: "Intimate jazz venue with craft cocktails",
        rating: 4.7,
        priceLevel: "$$",
        address: "789 Music Ave",
        phone: "(555) 345-6789",
        hours: "7:00 PM - 12:00 AM",
        image: "🎭",
        features: ["Live Music", "Craft Cocktails", "Intimate Setting"]
      },
      {
        name: "Couples Massage Spa",
        category: "wellness",
        description: "Relaxing couples massage packages",
        rating: 4.9,
        priceLevel: "$$$",
        address: "321 Wellness Blvd",
        phone: "(555) 456-7890",
        hours: "9:00 AM - 8:00 PM",
        image: "🧘",
        features: ["Couples Packages", "Aromatherapy", "Relaxation"]
      },
      {
        name: "Historic District Tour",
        category: "culture",
        description: "Self-guided walking tour of historic downtown",
        rating: 4.3,
        priceLevel: "Free",
        address: "City Hall",
        phone: "",
        hours: "Anytime",
        image: "🏛️",
        features: ["Self-Guided", "Historical", "Educational"]
      }
    ]

    // Filter based on selected category
    if (selectedCategory === 'all') {
      return sampleActivities
    }
    return sampleActivities.filter(activity => activity.category === selectedCategory)
  }

  const handleSearch = () => {
    searchActivities()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff8e1' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🌟</div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading local activities...</p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', maxWidth: '1400px', margin: '0 auto 30px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ←
          </button>
          <img src="/NestMates_App_Icon.png" alt="NestMates" style={{ height: '48px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Local Activities</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Search & Filters */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
          
          {/* Search Bar */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search for specific activities, restaurants, or venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
              />
              <button 
                onClick={handleSearch}
                style={{ backgroundColor: '#f97316', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Category</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `2px solid ${selectedCategory === category.id ? '#f97316' : '#e5e7eb'}`,
                    backgroundColor: selectedCategory === category.id ? '#fed7aa' : 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Distance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            
            {/* Budget Filter */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Budget</h3>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
              >
                {budgetOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Distance</h3>
              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
              </select>
            </div>

            {/* Location Info */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Your Location</h3>
              <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
                📍 {profile?.location_city}, {profile?.location_state}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
          
          {/* Results Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              {searching ? 'Searching...' : `Found ${activities.length} Activities`}
            </h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {selectedCategory !== 'all' && `${categories.find(c => c.id === selectedCategory)?.label} • `}
              Within {selectedDistance} miles
            </div>
          </div>

          {/* Loading State */}
          {searching ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
              <p style={{ color: '#6b7280' }}>Finding perfect activities for you...</p>
              <div style={{ width: '40px', height: '40px', border: '4px solid #fed7aa', borderTop: '4px solid #f97316', borderRadius: '50%', margin: '20px auto', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            
            /* Activities Grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
              {activities.map((activity, index) => (
                <div key={index} style={{ 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  
                  {/* Activity Header */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '24px' }}>{activity.image}</span>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{activity.name}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px', color: '#6b7280' }}>
                          <span>⭐ {activity.rating}</span>
                          <span style={{ fontWeight: '600', color: '#059669' }}>{activity.priceLevel}</span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '15px' }}>
                      {activity.description}
                    </p>

                    {/* Features */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                      {activity.features.map((feature, idx) => (
                        <span key={idx} style={{ 
                          backgroundColor: '#fef3c7', 
                          color: '#92400e', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Contact Info */}
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px' }}>
                      <div style={{ marginBottom: '4px' }}>📍 {activity.address}</div>
                      {activity.phone && <div style={{ marginBottom: '4px' }}>📞 {activity.phone}</div>}
                      <div>🕒 {activity.hours}</div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ 
                        flex: 1, 
                        backgroundColor: '#f97316', 
                        color: 'white', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        cursor: 'pointer' 
                      }}>
                        Get Directions
                      </button>
                      <button style={{ 
                        backgroundColor: '#e5e7eb', 
                        color: '#1f2937', 
                        padding: '10px 15px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        cursor: 'pointer' 
                      }}>
                        ❤️ Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!searching && activities.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>No activities found</h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>Try adjusting your filters or search terms</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedBudget('all')
                  setSearchTerm('')
                }}
                style={{ backgroundColor: '#f97316', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Pro Tips */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', marginTop: '25px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>💡 Dating Tips for Empty Nesters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>Try New Things Together</h4>
              <p style={{ fontSize: '13px', color: '#0369a1', margin: 0 }}>Novelty activates brain chemistry that strengthens emotional bonds.</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Schedule Regular Date Nights</h4>
              <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>Consistency builds anticipation and prioritizes your relationship.</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>Mix Familiar with Adventure</h4>
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>Balance comfort with exploration for the perfect date combination.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
