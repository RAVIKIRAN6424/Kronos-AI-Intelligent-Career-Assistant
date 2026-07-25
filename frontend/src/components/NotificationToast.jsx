import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 3000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px'
    }}>
      {toasts.map(toast => {
        let border = 'var(--accent-cyan)';
        let bg = 'rgba(0, 242, 254, 0.15)';
        let Icon = Info;

        if (toast.type === 'error') {
          border = 'var(--accent-rose)';
          bg = 'rgba(244, 63, 94, 0.2)';
          Icon = AlertTriangle;
        } else if (toast.type === 'success') {
          border = 'var(--accent-emerald)';
          bg = 'rgba(16, 185, 129, 0.2)';
          Icon = CheckCircle;
        }

        return (
          <div
            key={toast.id}
            style={{
              background: bg,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${border}`,
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
              animation: 'slideIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={18} color={border} />
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
