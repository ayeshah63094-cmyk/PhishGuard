import { useState, useContext } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ScanSearch, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MessageScanner.css';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';

const MessageScanner = () => {
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/analyze/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze message');
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
    setMessage('');
    setResult(null);
  };

  // Function to highlight keywords in the original text
  const getHighlightedText = () => {
    if (!result || result.flaggedWords[0].includes('None')) {
      return message;
    }
    
    let highlightedMessage = message;
    const flagsToReplace = result.flaggedWords.map(w => w.replace(/"/g, ''));
    
    // Simple replacement (case-insensitive)
    flagsToReplace.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedMessage = highlightedMessage.replace(regex, '<mark class="highlight-danger">$1</mark>');
    });

    return <div dangerouslySetInnerHTML={{ __html: highlightedMessage }} />;
  };

  return (
    <div className="scanner-page container animate-fade-in">
      <div className="scanner-header text-center">
        <h1 className="text-glow">Message Scanner</h1>
        <p className="text-secondary">Paste SMS, emails, or chat messages for instant AI threat analysis.</p>
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
            <label htmlFor="message-input" className="sr-only">Message Content</label>
            <textarea
              id="message-input"
              className="analyze-textarea"
              placeholder="Paste the message you want to analyze..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isScanning || result !== null}
            ></textarea>
          </div>
          
          {!result && (
            <button 
              type="submit" 
              className={`btn-primary w-full flex-center gap-2 ${isScanning ? 'scanning' : ''}`}
              disabled={isScanning || !message.trim()}
            >
              {isScanning ? (
                <>
                  <ScanSearch className="spin-icon" size={20} /> Analyzing...
                </>
              ) : (
                <>
                  <ScanSearch size={20} /> Analyze Message
                </>
              )}
            </button>
          )}
        </form>

        {result && (
          <div className="scan-results-card animate-slide-up">
            <h3 className="results-title">Analysis Complete</h3>
            
            <div className={`status-banner status-${result.status.toLowerCase()}`}>
              <div className="status-icon">
                {result.status === 'Safe' && <ShieldCheck size={32} />}
                {result.status === 'Suspicious' && <AlertTriangle size={32} />}
                {result.status === 'Scam' && <ShieldAlert size={32} />}
              </div>
              <div className="status-info">
                <span className="status-label">Threat Level</span>
                <span className="status-value">{result.status} {result.status === 'Safe' && '✅'}{result.status === 'Suspicious' && '⚠️'}{result.status === 'Scam' && '❌'}</span>
              </div>
              <div className="score-ring">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className={`circle stroke-${result.status.toLowerCase()}`}
                    strokeDasharray={`${result.score}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{result.score}%</text>
                </svg>
                <div className="score-label">Risk</div>
              </div>
            </div>

            <div className="explanation-box mb-6">
              <div className="flex-center justify-start gap-2 mb-2">
                <Info size={18} className="text-secondary" />
                <h4 className="m-0">AI Verdict Explanation</h4>
              </div>
              <p className="text-secondary">{result.explanation}</p>
            </div>

            <div className="message-highlight-box mb-6">
              <h4 className="mb-2">Analyzed Content</h4>
              <div className="highlighted-text-container">
                {getHighlightedText()}
              </div>
            </div>

            <div className="flags-section">
              <h4 className="flex-center gap-2 justify-start"><AlertCircle size={18} /> Detected Keywords</h4>
              <ul className="flag-list">
                {result.flaggedWords.map((word, index) => (
                  <li key={index} className={`flag-item ${word.includes('None') ? 'safe-flag' : 'danger-flag'}`}>
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageScanner;
