'use client'

export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(255, 248, 225, 0.95), rgba(78, 205, 196, 0.95))',
      backgroundImage: `url(/sideimagehands.jpg), url(/couple-embracing.jpg)`,
      backgroundPosition: 'left center, right center',
      backgroundRepeat: 'no-repeat, no-repeat',
      backgroundSize: '20% auto, 15% auto',
      backgroundAttachment: 'fixed'
    }}>
      
      {/* Header */}
      <header style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <img src="/NestMates_Logo_Tagline.png" alt="NestMates" style={{ height: '60px' }} />
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{ backgroundColor: 'transparent', color: '#1f2937', padding: '10px 20px', borderRadius: '8px', border: '2px solid #1f2937', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
            >
              Login
            </button>
            <button 
              onClick={() => window.location.href = '/signup'}
              style={{ backgroundColor: '#f97316', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px', lineHeight: '1.2' }}>
            Rediscover Your Love Story After the Kids Leave Home
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '40px', lineHeight: '1.6' }}>
            AI-powered daily insights, personalized local date ideas, and conversation starters designed specifically for empty nester couples ready to reconnect.
          </p>
          <button 
            onClick={() => window.location.href = '/signup'}
            style={{ backgroundColor: '#f97316', color: 'white', padding: '16px 32px', borderRadius: '12px', border: 'none', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }}
          >
            Start Your Journey - Free
          </button>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px' }}>No credit card required • 7-day free trial</p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: '60px' }}>
            Everything You Need to Reconnect
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            {/* Feature 1: AI Insights */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧠</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Daily AI Insights</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Personalized relationship insights based on real psychology research from the Gottman Institute and neuroscience studies. Get daily exercises designed for empty nesters.
              </p>
              <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#92400e', margin: 0, fontStyle: 'italic' }}>
                  "Today's insight helped us have our deepest conversation in years!" - Sarah M.
                </p>
              </div>
            </div>

            {/* Feature 2: Smart Date Ideas */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌟</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Perfect Date Tonight</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                AI finds amazing local restaurants, activities, and experiences tailored to your interests and budget. Never run out of date ideas again.
              </p>
              <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#0369a1', margin: 0, fontStyle: 'italic' }}>
                  "We've discovered so many hidden gems in our own city!" - Mike & Linda
                </p>
              </div>
            </div>

            {/* Feature 3: Progress Tracking */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>See Your Growth</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Beautiful charts show your relationship health improving over time. Weekly check-ins and milestone celebrations keep you motivated.
              </p>
              <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#166534', margin: 0, fontStyle: 'italic' }}>
                  "Seeing our progress visually was so encouraging!" - Robert & Jane
                </p>
              </div>
            </div>

            {/* Feature 4: Conversation Starters */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Never Run Out of Things to Say</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                AI generates thoughtful conversation starters across 6 categories: dreams, memories, intimacy, and more. Perfect for dinner conversations.
              </p>
              <div style={{ backgroundColor: '#fdf2f8', padding: '15px', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#be185d', margin: 0, fontStyle: 'italic' }}>
                  "Our dinner conversations are amazing now!" - David & Susan
                </p>
              </div>
            </div>

            {/* Feature 5: Partner Connection */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💕</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Shared Journey</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Connect with your partner to share insights, progress, and experiences. Build your relationship together, step by step.
              </p>
              <div style={{ backgroundColor: '#fff7ed', padding: '15px', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#9a3412', margin: 0, fontStyle: 'italic' }}>
                  "We're both working on our relationship together!" - Tom & Maria
                </p>
              </div>
            </div>

            {/* Feature 6: Psychology-Based */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Science-Backed</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                Every insight is based on real research from relationship experts, neuroscience studies, and psychology specifically for empty nesters.
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontStyle: 'italic' }}>
                  "Finally, advice that actually works for our stage of life!" - Karen & Steve
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '60px' }}>
            How NestMates Works
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            <div>
              <div style={{ backgroundColor: 'white', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '36px' }}>1️⃣</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Tell Us About You</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Share your location, interests, and relationship goals. Takes just 2 minutes.
              </p>
            </div>
            
            <div>
              <div style={{ backgroundColor: 'white', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '36px' }}>2️⃣</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Get Personalized Content</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Receive daily insights, date ideas, and conversation starters tailored just for you.
              </p>
            </div>
            
            <div>
              <div style={{ backgroundColor: 'white', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '36px' }}>3️⃣</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Watch Your Love Grow</h3>
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                Track your progress, complete challenges, and rediscover the joy of being a couple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 20px', backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '60px' }}>
            Empty Nesters Love NestMates
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                "After 28 years of marriage, we thought we knew everything about each other. NestMates helped us discover we were just getting started!"
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>— Patricia & James, married 28 years</p>
            </div>
            
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                "The date recommendations are incredible! We've found so many new places in our own city. It's like dating again, but better."
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>— Carol & Richard, empty nesters for 3 years</p>
            </div>
            
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                "The conversation starters saved our dinner conversations! We actually look forward to talking about more than just work and schedules."
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>— Nancy & Bill, married 31 years</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
            Ready to Rediscover Your Love Story?
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: '1.6', marginBottom: '40px' }}>
            Join thousands of empty nester couples who are falling in love all over again.
          </p>
          <button 
            onClick={() => window.location.href = '/signup'}
            style={{ backgroundColor: '#f97316', color: 'white', padding: '18px 36px', borderRadius: '12px', border: 'none', fontSize: '20px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)', marginBottom: '15px' }}
          >
            Start Your Free Trial
          </button>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            7 days free • Cancel anytime • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <img src="/NestMates_App_Icon.png" alt="NestMates" style={{ height: '40px', marginBottom: '20px', filter: 'brightness(0) invert(1)' }} />
          <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '20px' }}>
            Helping empty nester couples rediscover their love story.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '14px', color: '#9ca3af' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '20px' }}>
            © 2025 NestMates.ai - All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
