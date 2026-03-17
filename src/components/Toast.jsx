import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="toast animate-fade-in box-glow" 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: type === 'success' ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 51, 102, 0.1)',
        border: `1px solid ${type === 'success' ? '#00ff80' : '#ff3366'}`,
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 9999,
        boxShadow: `0 0 15px ${type === 'success' ? 'rgba(0, 255, 128, 0.2)' : 'rgba(255, 51, 102, 0.2)'}`
      }}
    >
      {type === 'success' ? <CheckCircle size={20} color="#00ff80" /> : <AlertCircle size={20} color="#ff3366" />}
      <span style={{ fontWeight: 500 }}>{message}</span>
      <button 
        onClick={onClose} 
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '0'
        }}
      >
        <X size={18} className="hover:text-white" />
      </button>
    </div>
  );
};

export default Toast;
