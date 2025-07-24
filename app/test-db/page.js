'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestDatabase() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('profiles').select('count')
        if (error) {
          console.error('Supabase error:', error)
          setError(error.message)
        } else {
          setConnected(true)
        }
      } catch (err) {
        console.error('Connection failed:', err)
        setError(err.message)
      }
      setLoading(false)
    }
    testConnection()
  }, [])

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#1f2937' }}>
        Database Connection Test
      </h1>
      
      {loading ? (
        <div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #ea580c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Testing connection...</p>
        </div>
      ) : (
        <div>
          {connected ? (
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ color: '#059669', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Database Connected!
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Supabase is working perfectly. Ready to build user authentication!
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
              <h2 style={{ color: '#dc2626', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Connection Failed
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                There's an issue with the database connection.
              </p>
              {error && (
                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '2rem',
                  border: '1px solid #fecaca'
                }}>
                  <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                    Error: {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <a 
        href="/" 
        style={{ 
          color: '#ea580c', 
          textDecoration: 'none',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}
      >
        ← Back to Home
      </a>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
