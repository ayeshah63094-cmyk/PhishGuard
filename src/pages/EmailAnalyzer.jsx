import { useState, useContext } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, Mail, Upload, Link as LinkIcon, AlertCircle, FileText, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './EmailAnalyzer.css';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';

const EmailAnalyzer = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!emailContent.trim()) return;

    if (!user) {
      navigate('/login');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/analyze/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emailContent })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze email');
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
    setEmailContent('');
    setResult(null);
  };

  return (
    <div className="scanner-page container animate-fade-in">
      <div className="scanner-header text-center">
        <h1 className="text-glow">Email Analyzer</h1>
        <p className="text-secondary">Inspect email headers, embedded content, and sender reputation for spear-phishing tactics.</p>
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
            <label htmlFor="email-input" className="sr-only">Email Content</label>
            <textarea
              id="email-input"
              className="analyze-textarea email-textarea"
              placeholder="Paste the email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              disabled={isScanning || result !== null}
            ></textarea>
          </div>
          
          <div className="flex-center mb-6 upload-section">
             <button type="button" className="btn-icon-text text-secondary" disabled={isScanning || result !== null}>
               <Upload size={18} />
               <span>Upload Screenshot (.jpg, .png)</span>
             </button>
          </div>
          
          {!result && (
            <button 
              type="submit" 
              className={`btn-primary w-full flex-center gap-2 ${isScanning ? 'scanning' : ''}`}
              disabled={isScanning || !emailContent.trim()}
            >
              {isScanning ? (
                <>
                  <Mail className="spin-icon" size={20} /> Analyzing Headers & Content...
                </>
              ) : (
                <>
                  <Search size={20} /> Analyze Email
                </>
              )}
            </button>
          )}
        </form>
          
        {result && (
          <div className="scan-results-card animate-slide-up">
            <h3 className="results-title">Deep Scan Complete</h3>
            
            <div className={`status-banner status-${result.status.toLowerCase()}`}>
              <div className="status-icon">
                {result.status === 'Safe' && <ShieldCheck size={32} />}
                {result.status === 'Suspicious' && <AlertTriangle size={32} />}
                {result.status === 'Phishing' && <ShieldAlert size={32} />}
              </div>
              <div className="status-info">
                <span className="status-label">Email Threat Level</span>
                <span className="status-value flex-center gap-2 justify-start">
                  {result.status} 
                  {result.status === 'Safe' && '✅'}
                  {result.status === 'Suspicious' && '⚠️'}
                  {result.status === 'Phishing' && '❌'}
                </span>
              </div>
              <div className="score-ring">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className={`circle stroke-${result.status.toLowerCase()=== 'phishing' ? 'scam' : result.status.toLowerCase()}`}
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

            <div className="explanation-box mt-6 mb-6" style={{background: 'rgba(17, 17, 20, 0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.2rem', borderLeft: '3px solid var(--accent-blue)'}}>
              <div className="flex-center justify-start gap-2 mb-2">
                <Info size={18} className="text-secondary" />
                <h4 className="m-0" style={{margin: 0}}>AI Verdict Explanation</h4>
              </div>
              <p className="text-secondary">{result.explanation}</p>
            </div>

            <div className="analysis-grid email-grid mt-6 mb-6">
              <div className="analysis-card">
                <div className="analysis-header">
                  <CheckCircle size={18} className="text-secondary" />
                  <span className="analysis-label">Sender Authenticity</span>
                </div>
                <div className={`analysis-value ${result.details.senderStatus.includes('Verified') ? 'text-safe' : 'text-danger'}`}>
                  {result.details.senderStatus}
                </div>
              </div>

              <div className="analysis-card">
                <div className="analysis-header">
                  <FileText size={18} className="text-secondary" />
                  <span className="analysis-label">Grammar & Tone</span>
                </div>
                <div className={`analysis-value ${result.details.grammarQuality === 'Good' ? 'text-safe' : 'text-suspicious'}`}>
                  {result.details.grammarQuality}
                </div>
              </div>

              <div className="analysis-card">
                <div className="analysis-header">
                  <LinkIcon size={18} className="text-secondary" />
                  <span className="analysis-label">Suspicious Links</span>
                </div>
                <div className={`analysis-value ${result.details.suspiciousLinks === 'Found' ? 'text-danger' : 'text-safe'}`}>
                  {result.details.suspiciousLinks}
                </div>
              </div>

              <div className="analysis-card">
                <div className="analysis-header">
                  <AlertCircle size={18} className="text-secondary" />
                  <span className="analysis-label">Urgency Indicators</span>
                </div>
                <div className={`analysis-value ${result.details.urgentLanguage === 'Detected' ? 'text-danger' : 'text-safe'}`}>
                  {result.details.urgentLanguage}
                </div>
              </div>
            </div>

            <div className="flags-section mt-6">
              <h4 className="flex-center gap-2 justify-start"><AlertCircle size={18} /> Flagged Phrases</h4>
              <ul className="flag-list mt-2">
                {result.flaggedPhrases.map((phrase, index) => (
                  <li key={index} className={`flag-item ${phrase.includes('None') ? 'safe-flag' : 'danger-flag'}`}>
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
            
            <button onClick={resetScanner} className="btn-secondary mt-6 mx-auto block">
              Analyze Another Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailAnalyzer;
