import { useState, useEffect } from 'react'
import './App.css'

// 1. Brand Mark SVG (Three connected squircles/rects)
interface ChainLogoProps {
  className?: string;
  size?: number;
}
function ChainLogo({ className, size = 60 }: ChainLogoProps) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="21" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="4.5" opacity="0.34" />
      <rect x="21" y="21" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="4.5" opacity="0.64" />
      <rect x="36" y="21" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="4.5" />
    </svg>
  )
}

// 2. Apple App Store Button SVG & Stack
interface AppStoreBtnProps {
  variant: 'dark' | 'light';
}
function AppStoreBtn({ variant }: AppStoreBtnProps) {
  const btnClass = variant === 'dark' ? 'app-store-btn dark-var' : 'app-store-btn light-var'
  
  return (
    <a 
      href="https://apps.apple.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={btnClass}
    >
      <svg 
        className="apple-logo-svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.17.67-2.88 1.48-.62.71-1.16 1.85-1.02 2.96 1.1.09 2.21-.57 2.91-1.38z"/>
      </svg>
      <div className="btn-text-stack">
        <span className="btn-subtitle">Download on the</span>
        <span className="btn-title">App Store</span>
      </div>
    </a>
  )
}

// 3. Checklist bullet SVG
function CheckBullet() {
  return (
    <svg className="check-bullet-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#161616" />
      <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function App() {
  const [currentRoute, setCurrentRoute] = useState<'home' | 'privacy'>('home')

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#privacy') {
        setCurrentRoute('privacy')
        window.scrollTo(0, 0)
      } else {
        setCurrentRoute('home')
      }
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    // Reveal animations on scroll
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    }

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersect, observerOptions)
    const revealElements = document.querySelectorAll(
      '.reveal-on-scroll, .reveal-slide-left, .reveal-slide-right'
    )

    revealElements.forEach((el) => observer.observe(el))

    return () => {
      revealElements.forEach((el) => observer.unobserve(el))
    }
  }, [currentRoute])


  if (currentRoute === 'privacy') {
    return (
      <>
        {/* Sticky Nav */}
        <nav className="sticky-nav">
          <div className="container nav-inner">
            <div className="nav-left">
              <a href="#" className="nav-left" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="nav-logo-box">
                  <ChainLogo size={40} />
                </div>
                <span className="nav-title">Cadence</span>
              </a>
            </div>
            <div className="nav-right">
              <a href="#features" className="nav-link">Features</a>
              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="download-pill-btn">
                Download
              </a>
            </div>
          </div>
        </nav>

        {/* Privacy Policy Content */}
        <main className="privacy-container">
          <h1 className="privacy-title">Privacy Policy for Cadence</h1>
          <span className="privacy-date">Last Updated: June 27, 2026</span>
          
          <div className="privacy-section">
            <p>
              Dawid Weiss ("we", "our", or "us") operates the Cadence mobile application (the "App"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our App.
            </p>
          </div>

          <div className="privacy-section">
            <h3>1. Information We Collect</h3>
            <p>
              To provide the core habit tracking and data synchronization features, the App collects the following information:
            </p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you sign in using Google or Apple Authentication, we receive your email address and name associated with your authentication account.
              </li>
              <li>
                <strong>App Data:</strong> We collect and store your habit definitions, completed habit logs, tracked activity sessions, settings, and device synchronization timestamps.
              </li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>2. How We Use Your Information</h3>
            <p>We use the collected data solely to:</p>
            <ul>
              <li>Set up and maintain your user account.</li>
              <li>Synchronize your habits and tracking logs across multiple devices.</li>
              <li>Securely back up your progress so you do not lose data if you reinstall the app or change devices.</li>
            </ul>
            <p>
              We do not use your data for advertising, and we do not sell, rent, or share your personal data with third-party companies.
            </p>
          </div>

          <div className="privacy-section">
            <h3>3. Data Storage and Security</h3>
            <p>
              All synchronized data is securely transmitted and stored on our database servers hosted by Supabase. We implement industry-standard security measures to protect your database records.
            </p>
          </div>

          <div className="privacy-section">
            <h3>4. User Rights and Data Deletion</h3>
            <p>We believe in full user control over personal data. You have the right to delete your information at any time:</p>
            <ul>
              <li>
                <strong>In-App Account Deletion:</strong> You can permanently delete your account and all associated synced data from our servers directly within the app by going to Settings -&gt; Account -&gt; Delete Account.
              </li>
              <li>
                <strong>Request Deletion:</strong> Alternatively, you can contact us at <a href="mailto:cadenceappsupport@gmail.com">cadenceappsupport@gmail.com</a> to request manual account deletion.
              </li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>5. Children's Privacy</h3>
            <p>
              Our App is not intended for children under 13, and we do not knowingly collect personal information from children under 13.
            </p>
          </div>

          <div className="privacy-section">
            <h3>6. Changes to This Privacy Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this page.
            </p>
          </div>

          <div className="privacy-section">
            <h3>7. Contact Us</h3>
            <p>If you have any questions or suggestions about this Privacy Policy, please contact us at:</p>
            <p>
              Email: <a href="mailto:cadenceappsupport@gmail.com">cadenceappsupport@gmail.com</a>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer-divider">
          <div className="container footer-inner">
            <div className="footer-left">
              <a href="#" className="footer-left" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="footer-logo-box">
                  <ChainLogo size={24} />
                </div>
                <span className="footer-logo-text">Cadence</span>
              </a>
            </div>
            <div className="footer-mid-links">
              <a href="https://thecadenceapp.eu/#privacy">Privacy Policy</a>
              <a href="mailto:cadenceappsupport@gmail.com">cadenceappsupport@gmail.com</a>
            </div>
            <span className="footer-right">&copy; 2026 Cadence &middot; Designed in Noir</span>
          </div>
        </footer>
      </>
    )
  }

  return (
    <>
      {/* Sticky Nav */}
      <nav className="sticky-nav">
        <div className="container nav-inner">
          <div className="nav-left">
            <a href="#" className="nav-left" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="nav-logo-box">
                <ChainLogo size={40} />
              </div>
              <span className="nav-title">Cadence</span>
            </a>
          </div>
          <div className="nav-right">
            <a href="#features" className="nav-link">Features</a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="download-pill-btn">
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-container container">
        <div className="hero-inner">
          <div className="hero-left-col">
            <div className="eyebrow-chip">
              <div className="eyebrow-logo-box">
                <ChainLogo size={18} />
              </div>
              <span className="eyebrow-text">TIME & HABITS · ONE APP</span>
            </div>
            <h1 className="hero-title">
              Build a rhythm<br />
              that <em>sticks</em>.
            </h1>
            <p className="hero-desc">
              Track the hours that matter and the habits that compound — Cadence turns your days into a streak you won't want to break.
            </p>
            <div className="hero-cta-row">
              <AppStoreBtn variant="dark" />
              <div className="trust-cluster">
                <div className="stars-row">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="trust-caption">Loved by early users</span>
              </div>
            </div>
          </div>

          <div className="hero-right-col">
            <div className="phone-stage">
              <div className="soft-halo"></div>
              {/* Back Phone: Weekly Detail & Timing */}
              <div className="hero-phone-behind">
                <div className="phone-mockup">
                  <img 
                    src="/screen-charts.png" 
                    className="phone-mockup-screen" 
                    alt="Cadence weekly detail statistics mockup" 
                  />
                </div>
              </div>
              {/* Front Phone: Active Timer */}
              <div className="hero-phone-front">
                <div className="phone-mockup">
                  <img 
                    src="/screen-activity.png" 
                    className="phone-mockup-screen" 
                    alt="Cadence live tracking session mockup" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Grid Section */}
      <section id="features" className="features-section">
        <div className="container features-inner">
          <div className="features-header reveal-on-scroll">
            <h4 className="features-eyebrow">WHAT'S INSIDE</h4>
            <h2 className="features-title">Everything you need to keep the streak alive.</h2>
          </div>
          
          <div className="features-cards-row">
            {/* Card 1: Time tracking */}
            <div className="feature-card reveal-on-scroll" style={{ '--delay': '0s' } as React.CSSProperties}>
              <div className="feature-icon-tile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="13" r="8" />
                  <line x1="12" y1="13" x2="12" y2="9" />
                  <line x1="10" y1="2" x2="14" y2="2" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                </svg>
              </div>
              <h3 className="feature-card-title">Time tracking</h3>
              <p className="feature-card-desc">
                A one-tap live timer for deep work, side projects and everything between. See exactly where your hours go.
              </p>
            </div>

            {/* Card 2: Daily habits */}
            <div className="feature-card reveal-on-scroll" style={{ '--delay': '0.15s' } as React.CSSProperties}>
              <div className="feature-icon-tile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <polyline points="9 16 11 18 15 13" />
                </svg>
              </div>
              <h3 className="feature-card-title">Daily habits</h3>
              <p className="feature-card-desc">
                Check off your day and watch the chain grow link by link. Streaks that are satisfying to keep.
              </p>
            </div>

            {/* Card 3: Insightful charts */}
            <div className="feature-card reveal-on-scroll" style={{ '--delay': '0.3s' } as React.CSSProperties}>
              <div className="feature-icon-tile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" />
                  <rect x="6" y="16" width="3" height="5" />
                  <rect x="11" y="12" width="3" height="9" />
                  <rect x="16" y="18" width="3" height="3" />
                </svg>
              </div>
              <h3 className="feature-card-title">Insightful charts</h3>
              <p className="feature-card-desc">
                Weekly and monthly views turn raw sessions into trends you can actually read at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase 1 — Habits (text left, phone right) */}
      <section className="container section-pad">
        <div className="showcase-row">
          <div className="showcase-text-col reveal-slide-left">
            <div className="showcase-eyebrow-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <polyline points="9 16 11 18 15 13" />
              </svg>
              <span className="showcase-eyebrow-text">HABITS</span>
            </div>
            <h2 className="showcase-title">Streaks that don't break.</h2>
            <p className="showcase-desc">
              Every habit is a chain of links. Tick today off and watch your chain grow — a simple, satisfying way to stay on track.
            </p>
            <div className="showcase-checklist">
              <div className="checklist-item">
                <CheckBullet />
                <span className="checklist-label">Daily, weekly or custom cadences</span>
              </div>
              <div className="checklist-item">
                <CheckBullet />
                <span className="checklist-label">Rings, grids and an at-a-glance monthly view</span>
              </div>
              <div className="checklist-item">
                <CheckBullet />
                <span className="checklist-label">Morning, midday and evening grouping</span>
              </div>
            </div>
          </div>

          <div className="showcase-phone-col reveal-slide-right">
            <div className="showcase-phone-wrapper">
              <div className="phone-mockup">
                <img 
                  src="/screen-habits.png" 
                  className="phone-mockup-screen" 
                  alt="Cadence daily habits listing screen mockup" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase 2 — Insights (phone left, text right) */}
      <section className="showcase-insights">
        <div className="container section-pad">
          <div className="showcase-row" style={{ flexDirection: 'row-reverse' }}>
            <div className="showcase-text-col reveal-slide-right">
              <div className="showcase-eyebrow-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" />
                  <rect x="6" y="16" width="3" height="5" />
                  <rect x="11" y="12" width="3" height="9" />
                  <rect x="16" y="18" width="3" height="3" />
                </svg>
                <span className="showcase-eyebrow-text">INSIGHTS</span>
              </div>
              <h2 className="showcase-title">Know your trends.</h2>
              <p className="showcase-desc">
                Cadence quietly keeps score. Weekly bars and a monthly heatmap show your rhythm building — and exactly where the gaps are.
              </p>
              <div className="showcase-checklist">
                <div className="checklist-item">
                  <CheckBullet />
                  <span className="checklist-label">Weekly bars and a monthly heatmap</span>
                </div>
                <div className="checklist-item">
                  <CheckBullet />
                  <span className="checklist-label">Filter by day, week or month</span>
                </div>
              </div>
            </div>

            <div className="showcase-phone-col reveal-slide-left">
              <div className="showcase-phone-wrapper">
                <div className="phone-mockup">
                <img 
                  src="/screen-detail.png" 
                  className="phone-mockup-screen" 
                  alt="Cadence habit detail statistics calendar heatmap mockup" 
                />
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="cta-outer">
        <div className="cta-inner-card reveal-on-scroll">
          <div className="cta-logo">
            <ChainLogo size={40} />
          </div>
          <h2 className="cta-title">Start your streak today.</h2>
          <p className="cta-desc">Free on iPhone. Your rhythm is one tap away.</p>
          <AppStoreBtn variant="light" />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-divider">
        <div className="container footer-inner">
          <div className="footer-left">
            <a href="#" className="footer-left" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="footer-logo-box">
                <ChainLogo size={24} />
              </div>
              <span className="footer-logo-text">Cadence</span>
            </a>
          </div>
          <div className="footer-mid-links">
            <a href="https://thecadenceapp.eu/#privacy">Privacy Policy</a>
            <a href="mailto:cadenceappsupport@gmail.com">cadenceappsupport@gmail.com</a>
          </div>
          <span className="footer-right">&copy; 2026 Cadence &middot; Designed in Noir</span>
        </div>
      </footer>
    </>
  )
}

export default App
