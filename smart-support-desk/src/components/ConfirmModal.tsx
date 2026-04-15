interface ConfirmModalProps {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <>
      {/* Overlay */}
      <div onClick={onCancel} style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 41, 34, 0.45)',
        zIndex: 998
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        background: '#ffffff',
        borderRadius: '12px',
        padding: '28px',
        width: '380px',
        maxWidth: '90vw',
        boxShadow: '0 8px 32px rgba(14,124,107,0.12)',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        
        {/* Icon */}
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          background: '#FEE2E2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '15px', fontWeight: 700,
          color: '#0F2922', margin: '0 0 8px'
        }}>
          {title || 'Delete this ticket?'}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '13px', color: '#4B6B63',
          margin: '0 0 24px', lineHeight: 1.5
        }}>
          {message || 'This action cannot be undone. The ticket will be permanently removed.'}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            background: 'transparent',
            border: '1px solid #DDE8E5',
            color: '#4B6B63',
            borderRadius: '6px',
            padding: '9px 20px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            background: '#DC2626',
            border: 'none',
            color: 'white',
            borderRadius: '6px',
            padding: '9px 20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            Yes, delete
          </button>
        </div>
      </div>
    </>
  );
}

