import { useState, useEffect, useContext } from 'react';
import { ShieldCheck, Database, AlertOctagon, Info, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing established card styles

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app we'd check user role. Here we just ensure auth.
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAllHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/analyze/all-history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch global history');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHistory();
  }, [user, token, navigate]);

  const totalScans = history.length;
  const scamCount = history.filter(h => h.status === 'Scam' || h.status === 'Dangerous' || h.status === 'Phishing').length;
  const safeCount = history.filter(h => h.status === 'Safe').length;

  return (
    <div className="dashboard-page container animate-fade-in" style={{ maxWidth: '1200px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div className="welcome-section">
          <h1 className="text-glow flex items-center gap-2">
            <Database className="text-accent" /> Admin Panel
          </h1>
          <p className="text-secondary">Overview of global system activity and metrics.</p>
        </div>
      </header>
      
      {/* Simple Analytics Grid */}
      <div className="dashboard-stats box-glow" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-item text-center p-4">
          <span className="stat-label">Total Platform Scans</span>
          <span className="stat-value text-glow" style={{color: 'var(--text-primary)'}}>{totalScans}</span>
        </div>
        <div className="stat-item text-center p-4 border-l border-white/10">
          <span className="stat-label">Total Threats Blocked</span>
          <span className="stat-value text-glow" style={{color: '#ff3366'}}>{scamCount}</span>
        </div>
        <div className="stat-item text-center p-4 border-l border-white/10">
          <span className="stat-label">Safe Items Verified</span>
          <span className="stat-value text-glow" style={{color: '#00ff80'}}>{safeCount}</span>
        </div>
      </div>

      <div className="history-section mt-8">
        <h2 className="section-title text-left mb-4">Global Scan Registry</h2>
        
        {loading ? (
           <p className="text-secondary text-center py-4">Fetching logs...</p>
        ) : error ? (
           <div className="auth-error box-glow" style={{borderColor: '#ff3366', background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '1rem', borderRadius: '8px'}}>{error}</div>
        ) : history.length === 0 ? (
           <p className="text-secondary text-center">No scans recorded yet.</p>
        ) : (
          <div className="history-list" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Type</th>
                  <th style={{ padding: '1rem' }}>Input Sample</th>
                  <th style={{ padding: '1rem' }}>Risk Score</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(scan => (
                   <tr key={scan._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                     <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(scan.createdAt).toLocaleString()}</td>
                     <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{scan.user?.name || 'Unknown'}</td>
                     <td style={{ padding: '1rem', fontWeight: 600 }}>{scan.type}</td>
                     <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{scan.inputData}"</td>
                     <td style={{ padding: '1rem', fontWeight: 'bold' }}>{scan.score}%</td>
                     <td style={{ padding: '1rem' }}>
                        <span style={{
                           padding: '0.2rem 0.6rem', 
                           borderRadius: '50px',
                           fontSize: '0.75rem',
                           fontWeight: 'bold',
                           background: scan.status.includes('Safe') ? 'rgba(0, 255, 128, 0.1)' : scan.status.includes('Suspicious') ? 'rgba(255, 191, 0, 0.1)' : 'rgba(255, 51, 102, 0.1)',
                           color: scan.status.includes('Safe') ? '#00ff80' : scan.status.includes('Suspicious') ? '#ffbf00' : '#ff3366',
                        }}>
                           {scan.status}
                        </span>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
