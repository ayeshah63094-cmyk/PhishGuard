import { useState, useContext } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, Activity, Lock, Globe, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UrlScanner.css';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';

const UrlScanner = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!user) {
      navigate('/login');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/analyze/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze URL');
      }

      setResult(data);
      setShowToast(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setUrl('');
    setResult(null);
  };

  return (
    <div className="scanner-page container animate-fade-in">
      <div className="scanner-header text-center">
        <h1 className="text-glow">URL Scanner</h1>
        <p className="text-secondary">Analyze links for phishing signatures, obscure redirects, and malware hosting before visiting.</p>
      </div>

      <div className="scanner-container box-glow">
        <form onSubmit={handleScan} className="scanner-form">
          {error && (
            <div className="auth-error box-glow" style={{borderColor: '#ff3366', background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
          )}
          <div className="input-group">
            <label htmlFor="url-input" className="sr-only">URL to Scan</label>
            <div className="input-with-icon url-input-wrapper">
              <Globe className="input-icon" size={24} />
              <input
                type="text"
                id="url-input"
                className="input-field pl-12 analyze-input text-lg"
                placeholder="Enter a website link (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScanning || result !== null}
              />
            </div>
          </div>
          
          {!result && (
            <button 
              type="submit" 
              className={`btn-primary w-full flex-center gap-2 ${isScanning ? 'scanning' : ''}`}
              disabled={isScanning || !url.trim()}
            >
              {isScanning ? (
                <>
                  <Search className="spin-icon" size={20} /> Scanning URL...
                </>
              ) : (
                <>
                  <Search size={20} /> Scan URL
                </>
              )}
            </button>
          )}
          
          {result && (
            <button type="button" onClick={resetScanner} className="btn-secondary w-full mt-4">
              Scan Another URL
            </button>
          )}
        </form>

        {result && (
          <div className="scan-results-card animate-slide-up">
            <h3 className="results-title">Scan Results</h3>
            
            <div className={`status-banner status-${result.status.toLowerCase()}`}>
              <div className="status-icon">
                {result.status === 'Safe' && <ShieldCheck size={32} />}
                {result.status === 'Suspicious' && <AlertTriangle size={32} />}
                {result.status === 'Dangerous' && <ShieldAlert size={32} />}
              </div>
              <div className="status-info">
                <span className="status-label">Website Status</span>
                <span className="status-value flex-center gap-2 justify-start">
                  {result.status} 
                  {result.status === 'Safe' && '✅'}
                  {result.status === 'Suspicious' && '⚠️'}
                  {result.status === 'Dangerous' && '❌'}
                </span>
              </div>
              <div className="score-ring">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className={`circle stroke-${result.status.toLowerCase()=== 'dangerous' ? 'scam' : result.status.toLowerCase()}`}
                    strokeDasharray={`${result.score}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{result.score}%</text>
                </svg>
                <div className="score-label">Risk Score</div>
              </div>
            </div>

            <div className="explanation-box mb-6" style={{background: 'rgba(17, 17, 20, 0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.2rem', borderLeft: '3px solid var(--accent-blue)'}}>
              <div className="flex-center justify-start gap-2 mb-2">
                <Info size={18} className="text-secondary" />
                <h4 className="m-0" style={{margin: 0}}>AI Verdict Explanation</h4>
              </div>
              <p className="text-secondary">{result.explanation}</p>
            </div>

            <div className="analysis-grid mt-0">
              <div className="analysis-card">
                <div className="analysis-header">
                  <Lock size={18} className="text-secondary" />
                  <span className="analysis-label">HTTPS Security</span>
                </div>
                <div className={`analysis-value ${result.details.https === 'Yes' ? 'text-safe' : 'text-danger'}`}>
                  {result.details.https}
                </div>
              </div>

              <div className="analysis-card">
                <div className="analysis-header">
                  <Activity size={18} className="text-secondary" />
                  <span className="analysis-label">Domain Age</span>
                </div>
                <div className={`analysis-value ${result.details.domainAge.includes('New') ? 'text-danger' : result.details.domainAge.includes('Recent') ? 'text-suspicious' : 'text-safe'}`}>
                  {result.details.domainAge}
                </div>
              </div>

              <div className="analysis-card">
                <div className="analysis-header">
                  <AlertCircle size={18} className="text-secondary" />
                  <span className="analysis-label">Suspicious Keywords</span>
                </div>
                <div className={`analysis-value ${result.details.suspiciousKeywords === 'Detected' ? 'text-danger' : 'text-safe'}`}>
                  {result.details.suspiciousKeywords}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlScanner;
