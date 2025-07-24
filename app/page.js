export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fff7ed 0%, #f0fdfa 100%)'
    }}>
      {/* Header */}
      <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/NestMates_App_Icon.png" 
              alt="NestMates Logo" 
              style={{ height: '48px', width: 'auto' }}
            />
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#features" style={{ color: '#6b7280', textDecoration: 'none' }}>Features</a>
            <a href="#about" style={{ color: '#6b7280', textDecoration: 'none' }}>About</a>
            <a href="#contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Your Beautiful Logo */}
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src="/NestMates_Logo_Tagline.png" 
              alt="NestMates - Rediscover Love Together" 
              style={{ height: '200px', width: 'auto', margin: '0 auto', display: 'block', marginBottom: '1.5rem' }}
            />
          </div>
          
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}>
            Rediscover Each Other
            <br />
            <span style={{ color: '#ea580c' }}>After the Kids Leave Home</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#4b5563', 
            marginBottom: '2rem', 
            lineHeight: '1.6'
          }}>
            NestMates uses AI to find perfect local activities tailored to you and your partner's interests. 
            Reconnect, explore, and fall in love all over again.
          </p>
          
          {/* Email Signup */}
          <div style={{ marginBottom: '2rem' }}>
            <a 
              href="http://eepurl.com/jiImeY" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              Get Early Access →
            </a>
          </div>
          
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Join 500+ couples already on the waitlist • No spam, unsubscribe anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '3rem' }}>
            How NestMates Helps You Reconnect
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Feature 1 */}
            <div style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#fff7ed' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#ea580c', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                🧠
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                AI-Powered Matching
              </h3>
              <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>
                Smart recommendations based on your unique preferences, interests, and relationship goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#f0fdfa' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#0d9488', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                📍
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Local Discovery
              </h3>
              <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>
                Find hidden gems and exciting events in your area that you never knew existed.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#faf5ff' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#7c3aed', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                💕
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Relationship Growth
              </h3>
              <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>
                Daily insights backed by relationship science to help you grow closer together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        background: 'linear-gradient(135deg, #ea580c 0%, #0d9488 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
            Ready to Rediscover Your Love Story?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#fed7aa', marginBottom: '2rem' }}>
            Join hundreds of couples already on their journey to reconnection.
          </p>
          
          <a 
            href="http://eepurl.com/jiImeY" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'white',
              color: '#ea580c',
              padding: '1rem 2.5rem',
              borderRadius: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            Get Early Access Now →
          </a>
          
          <p style={{ color: '#fed7aa', fontSize: '0.875rem', marginTop: '1rem' }}>
            No spam, unsubscribe anytime • Privacy first approach
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <img 
              src="/NestMates_App_Icon.png" 
              alt="NestMates Logo" 
              style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <p style={{ color: '#9ca3af' }}>
            Helping empty nester couples rediscover their love through AI-powered local experiences.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '2rem' }}>
            © 2025 NestMates.ai - Rediscover Love Together
          </p>
        </div>
      </footer>
    </div>
  )
}
