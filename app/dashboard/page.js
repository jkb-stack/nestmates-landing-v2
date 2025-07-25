'use client'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [partnerCode, setPartnerCode] = useState('')
  const [hasPartner, setHasPartner] = useState(false)
  const [showInviteCode, setShowInviteCode] = useState(false)

  useEffect(() => {
    async function getUser() {
      try {
        const { supabase } = await import('../supabase')
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          // Redirect to login if not authenticated
          window.location.href = '/login'
          return
        }
        
        setUser(user)
        
        // Generate a simple partner code based on user ID
        const code = `NEST-${user.id.slice(-4).toUpperCase()}`
        setPartnerCode(code)
        
      } catch (err) {
        console.error('Error getting user:', err)
        window.location.href = '/login'
      }
      
      setLoading(false)
    }
    
    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      const { supabase } = await import('../supabase')
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  const copyPartnerCode = () => {
    navigator.clipboard.writeText(partnerCode)
    alert('Partner code copied to clipboard!')
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
          <p style={{ color: '#6b7280' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #f0fdfa 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '1rem 2rem',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/NestMates_App_Icon.png" 
              alt="NestMates" 
              style={{ height: '40px', width: 'auto' }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
              Dashboard
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Ready to rediscover your relationship? Let's start by connecting with your partner.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Partner Connection */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              💕 Connect with Your Partner
            </h2>
            
            {!hasPartner ? (
              <div>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Share your partner code with your loved one so they can join your NestMates journey.
                </p>
                
                <div style={{
                  backgroundColor: '#f3f4f6',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Your Partner Code:
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#ea580c',
                      fontFamily: 'monospace'
                    }}>
                      {partnerCode}
                    </span>
                    <button
                      onClick={copyPartnerCode}
                      style={{
                        backgroundColor: '#ea580c',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Or enter your partner's code:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="NEST-XXXX"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button style={{
                      backgroundColor: '#0d9488',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}>
                      Connect
                    </button>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fbbf24'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                    💡 <strong>Tip:</strong> Send your partner code via text or email. Once they join, you'll both share the same daily insights and activity recommendations!
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.5rem',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
                <h3 style={{ color: '#059669', marginBottom: '0.5rem' }}>Connected!</h3>
                <p style={{ color: '#065f46' }}>You and your partner are ready to start your journey together.</p>
              </div>
            )}
          </div>

          {/* Today's Insight */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🧠 Today's Relationship Insight
            </h2>
            
            <div style={{
              backgroundColor: '#faf5ff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e9d5ff',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#7c3aed',
                marginBottom: '0.75rem'
              }}>
                The Neuroscience of New Experiences
              </h3>
              <p style={{ color: '#6b46c1', lineHeight: '1.6', marginBottom: '1rem' }}>
                Research from Stanford University shows that when couples try new activities together, 
                their brains release dopamine and strengthen neural pathways associated with bonding and pleasure.
              </p>
              <p style={{ color: '#7c3aed', fontWeight: '500' }}>
                Today's Challenge: Plan one activity you've never done together before.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Connection Coins Earned: 50
              </span>
              <button style={{
                backgroundColor: '#ea580c',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>
                Mark Complete
              </button>
            </div>

            <p style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              marginTop: '1rem',
              fontStyle: 'italic'
            }}>
              Source: Journal of Personality and Social Psychology, 2024
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          marginTop: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            🎯 Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <button style={{
              padding: '1rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
              <div style={{ fontWeight: '600', color: '#92400e' }}>Plan Date Night</div>
              <div style={{ fontSize: '0.875rem', color: '#a16207' }}>AI recommendations</div>
            </button>
            
            <button style={{
              padding: '1rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💬</div>
              <div style={{ fontWeight: '600', color: '#065f46' }}>Communication Quiz</div>
              <div style={{ fontSize: '0.875rem', color: '#047857' }}>Improve understanding</div>
            </button>
            
            <button style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📍</div>
              <div style={{ fontWeight: '600', color: '#991b1b' }}>Local Events</div>
              <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>Discover nearby</div>
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
