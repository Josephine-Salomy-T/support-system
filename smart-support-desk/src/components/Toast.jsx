import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: '#F0FAF7', border: '#0E7C6B', dot: '#0E7C6B', text: '#0F2922' },
    error:   { bg: '#FEF2F2', border: '#DC2626', dot: '#DC2626', text: '#0F2922' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', dot: '#F59E0B', text: '#0F2922' },
    info:    { bg: '#EFF6FF', border: '#2563EB', dot: '#2563EB', text: '#0F2922' },
  };

  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderLeft: `4px solid ${c.dot}`,
      borderRadius: '8px',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '280px',
      maxWidth: '400px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animation: 'slideIn 200ms ease'
    }}>
      <div style={{
        width: '8px', height: '8px',
        borderRadius: '50%',
        background: c.dot,
        flexShrink: 0
      }} />
      <span style={{ fontSize: '13px', color: c.text, fontWeight: 500, flex: 1 }}>
        {message}
      </span>
      <button onClick={onClose} style={{
        background: 'transparent', border: 'none',
        cursor: 'pointer', color: '#8FA89F',
        fontSize: '16px', lineHeight: 1, padding: 0
      }}>×</button>
    </div>
  );
}

