'use client'
import { useEffect, useState } from 'react'

export default function BottomNavigation({ currentPage = 'dashboard' }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Auto-hide navigation on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: '🏠',
      href: '/dashboard',
      color: '#f97316'
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: '📍',
      href: '/local-activities',
      color: '#10b981'
    },
    {
      id: 'conversations',
      label: 'Chat',
      icon: '💬',
      href: '/conversations',
      color: '#8b5cf6'
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: '📊',
      href: '/progress',
      color: '#06b6d4'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/settings',
      color: '#6b7280'
    }
  ]

  const handleNavigation = (href) => {
    window.location.href = href
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div style={{ height: '85px' }} />
      
      {/* Bottom Navigation */}
      <nav 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -4px 25px rgba(0, 0, 0, 0.1)',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}
      >
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '12px 8px 28px 8px', // Extra bottom padding for mobile safe area
            maxWidth: '500px',
            margin: '0 auto'
          }}
        >
          {navigationItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease-in-out',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  minWidth: '60px'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#f3f4f6'
                    e.target.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.transform = 'scale(1)'
                  }
                }}
              >
                {/* Icon with active state */}
                <div
                  style={{
                    fontSize: '24px',
                    padding: '8px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? `${item.color}15` : 'transparent',
                    border: isActive ? `2px solid ${item.color}` : '2px solid transparent',
                    transition: 'all 0.2s ease-in-out',
                    minWidth: '40px',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </div>
                
                {/* Label */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? item.color : '#6b7280',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    style={{
                      width: '4px',
                      height: '4px',
                      backgroundColor: item.color,
                      borderRadius: '50%',
                      marginTop: '2px'
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
