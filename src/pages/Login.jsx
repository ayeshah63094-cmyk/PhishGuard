import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import './Auth.css';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page container animate-fade-in flex-center" style={{ minHeight: '80vh' }}>
      <div className="auth-card box-glow">
        <div className="auth-header text-center">
          <div className="icon-wrapper mx-auto mb-4" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 255, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={32} className="text-accent" />
          </div>
          <h1 className="text-glow mb-2">Welcome Back</h1>
          <p className="text-secondary">Login to access your security dashboard</p>
        </div>

        {error && (
            <div className="auth-error box-glow" style={{borderColor: '#ff3366', background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                id="email" 
                className="input-field" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                id="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-4" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Login to PhishGuard'}
          </button>
        </form>

        <div className="auth-footer text-center mt-6">
          <p className="text-secondary">
            Don't have an account? <Link to="/signup" className="text-accent hover-underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
