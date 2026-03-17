import { Link } from 'react-router-dom';
import { ShieldAlert, Fingerprint, Lock, ChevronRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page animate-fade-in">
      {/* Background glow effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      
      <section className="hero-section container">
        <div className="hero-content">
          <div className="badge-alert">
            <span className="live-dot"></span>
            ACTIVE THREAT DETECTION ONLINE
          </div>
          
          <h1 className="hero-title">
            PhishGuard <br/> <span className="text-glow">Stay Safe from Scams</span>
          </h1>
          
          <p className="hero-description text-secondary">
            Advanced AI-driven cybersecurity designed to protect you from phishing, 
            scam URLs, and malicious emails before they penetrate your defenses.
          </p>
          
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary flex-center gap-2">
              Get Started <ChevronRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Try Demo
            </Link>
          </div>
        </div>
        
        <div className="hero-graphic">
          <div className="cyber-shield-container">
            <ShieldAlert size={120} className="cyber-shield text-glow" />
            <div className="radar-sweep"></div>
          </div>
        </div>
      </section>
      
      <section className="features-preview container">
        <h2 className="section-title">Core Defenses</h2>
        <div className="features-grid">
          <div className="feature-card box-glow">
            <div className="feature-icon wrapper">
              <Lock size={32} className="text-accent" />
            </div>
            <h3>Military Grade Security</h3>
            <p>Your data is encrypted and protected with industry-leading protocols.</p>
          </div>
          
          <div className="feature-card box-glow">
            <div className="feature-icon wrapper">
              <Fingerprint size={32} className="text-accent" />
            </div>
            <h3>Identity Protection</h3>
            <p>Prevent identity theft with our advanced credential scanning algorithms.</p>
          </div>
          
          <div className="feature-card box-glow">
            <div className="feature-icon wrapper">
              <ShieldAlert size={32} className="text-accent" />
            </div>
            <h3>Real-Time Alerts</h3>
            <p>Instant notifications when a suspicious website or email is detected.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
