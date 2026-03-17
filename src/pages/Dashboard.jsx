import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MessageSquareWarning, Link as LinkIcon, MailWarning, Activity, ShieldAlert, AlertTriangle, AlertCircle } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analyze/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch scan history');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user, token, navigate]);
  return (
    <div className="dashboard-page container animate-fade-in">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1 className="text-glow">Operator Dashboard</h1>
          <p className="text-secondary">Welcome back, Agent. All systems nominal.</p>
        </div>
        <div className="status-badge flex-center gap-2">
          <span className="live-dot"></span>
          <span>System Active</span>
        </div>
      </header>
      
      <div className="dashboard-stats box-glow">
        <div className="stat-item">
          <span className="stat-label">Total Scans</span>
          <span className="stat-value text-accent">{history.length}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">Threats Detected</span>
          <span className="stat-value" style={{color: '#ff3366'}}>
            {history.filter(h => h.status === 'Scam' || h.status === 'Dangerous' || h.status === 'Phishing').length}
          </span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">System Health</span>
          <span className="stat-value text-glow" style={{color: 'var(--accent-neon)'}}>100%</span>
        </div>
      </div>

      <h2 className="section-title text-left mt-8 mb-4">Security Tools</h2>
      
      <div className="dashboard-grid">
        <div className="dashboard-card box-glow">
          <div className="card-header">
            <div className="icon-wrapper">
              <MessageSquareWarning size={24} />
            </div>
            <h3>Message Scanner</h3>
          </div>
          <p className="card-description text-secondary">
            Analyze SMS and instant messages for social engineering attempts and malicious payloads.
          </p>
          <Link to="/scanner/message" className="card-action btn-secondary w-full" style={{display: 'inline-block', textAlign: 'center'}}>Initialize Scan</Link>
        </div>

        <div className="dashboard-card box-glow">
          <div className="card-header">
            <div className="icon-wrapper">
              <LinkIcon size={24} />
            </div>
            <h3>URL Scanner</h3>
          </div>
          <p className="card-description text-secondary">
            Deep-scan links for phishing signatures, obscure redirects, and malware hosting.
          </p>
          <Link to="/scanner/url" className="card-action btn-secondary w-full" style={{display: 'inline-block', textAlign: 'center'}}>Analyze Link</Link>
        </div>

        <div className="dashboard-card box-glow">
          <div className="card-header">
            <div className="icon-wrapper">
              <MailWarning size={24} />
            </div>
            <h3>Email Analyzer</h3>
          </div>
          <p className="card-description text-secondary">
            Inspect headers, sender reputation, and embedded content for spear-phishing tactics.
          </p>
          <Link to="/scanner/email" className="card-action btn-secondary w-full" style={{display: 'inline-block', textAlign: 'center'}}>Inspect Headers</Link>
        </div>
        
        <div className="dashboard-card box-glow featured">
          <div className="card-header">
            <div className="icon-wrapper action-icon">
              <Activity size={24} className="text-glow" />
            </div>
            <h3>Live Threat Map</h3>
          </div>
          <p className="card-description text-secondary">
            Monitor real-time global phishing campaigns and emerging cybersecurity threats.
          </p>
          <button className="btn-primary w-full mt-auto">View Radar</button>
        </div>
      </div>

      <div className="history-section mt-8">
        <h2 className="section-title text-left mb-4">Recent Scans</h2>
        {error && (
            <div className="auth-error box-glow" style={{borderColor: '#ff3366', background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
        )}
        
        {loadingHistory ? (
          <p className="text-secondary text-center py-4">Loading your scan history...</p>
        ) : history.length === 0 ? (
          <div className="empty-state box-glow text-center" style={{padding: '3rem', borderRadius: '12px', border: '1px dashed var(--border-color)'}}>
            <ShieldCheck size={48} className="mx-auto mb-4 text-secondary" style={{opacity: 0.5}} />
            <h3 className="mb-2">No Scans Yet</h3>
            <p className="text-secondary">Run your first scan using the tools above to see your history here.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.slice(0, 10).map((scan) => (
              <div key={scan._id} className="history-item box-glow" style={{padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: `4px solid ${scan.status.includes('Safe') ? '#00ff80' : scan.status.includes('Suspicious') ? '#ffbf00' : '#ff3366'}`}}>
                <div className="flex justify-between items-start" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="flex items-center gap-2 mb-2" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      {scan.type === 'Message' && <MessageSquareWarning size={16} className="text-secondary" />}
                      {scan.type === 'URL' && <LinkIcon size={16} className="text-secondary" />}
                      {scan.type === 'Email' && <MailWarning size={16} className="text-secondary" />}
                      <span className="font-bold">{scan.type} Scan</span>
                      <span className="text-sm text-secondary" style={{fontSize: '0.85rem'}}>• {new Date(scan.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-secondary text-sm mb-2" style={{maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      "{scan.inputData}"
                    </p>
                  </div>
                  <div className={`status-badge text-sm font-bold`} style={{
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '50px',
                      background: scan.status.includes('Safe') ? 'rgba(0, 255, 128, 0.1)' : scan.status.includes('Suspicious') ? 'rgba(255, 191, 0, 0.1)' : 'rgba(255, 51, 102, 0.1)',
                      color: scan.status.includes('Safe') ? '#00ff80' : scan.status.includes('Suspicious') ? '#ffbf00' : '#ff3366',
                      border: `1px solid ${scan.status.includes('Safe') ? 'rgba(0, 255, 128, 0.3)' : scan.status.includes('Suspicious') ? 'rgba(255, 191, 0, 0.3)' : 'rgba(255, 51, 102, 0.3)'}`
                  }}>
                    {scan.status} ({scan.score}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
