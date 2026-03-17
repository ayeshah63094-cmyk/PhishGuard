import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, User } from 'lucide-react';
import { useState, useContext } from 'react';
import './Navbar.css';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo flex-center" onClick={closeMenu}>
          <Shield className="logo-icon text-glow" size={28} />
          <span className="logo-text">PhishGuard</span>
        </Link>

        <div className={`nav-elements ${isOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>

            {user && (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link
                to="/scanner/message"
                className={`nav-link ${isActive('/scanner/message') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Msg Scanner
              </Link>
            </li>
            <li>
              <Link
                to="/scanner/url"
                className={`nav-link ${isActive('/scanner/url') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                URL Scanner
              </Link>
            </li>
            <li>
              <Link
                to="/scanner/email"
                className={`nav-link ${isActive('/scanner/email') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Email Scanner
              </Link>
            </li>

            {user ? (
              <li className="mobile-login flex-center gap-2">
                <span className="text-secondary text-sm"><User size={14} className="inline mr-1" />{user.name}</span>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Logout</button>
              </li>
            ) : (
              <li className="mobile-login">
                <Link to="/login" className="btn-primary" onClick={closeMenu}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="nav-actions desktop-only">
          {user ? (
            <div className="flex-center gap-4">
              <span className="text-secondary text-sm"><User size={16} className="inline mr-1" />{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? <X size={24} className="text-glow" /> : <Menu size={24} className="text-glow" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
