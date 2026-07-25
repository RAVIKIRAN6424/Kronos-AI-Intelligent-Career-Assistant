import React from 'react';
import { Bot, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const WelcomeModal = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(2, 6, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel cyber-glow-pulse" style={{ width: '100%', maxWidth: '480px', padding: '36px', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', border: '1px solid var(--accent-cyan)' }}>
        
        {/* Animated AI Robot Avatar */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.15)', border: '2px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-cyan)' }}>
          <Bot size={44} color="var(--accent-cyan)" />
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', color: '#ffffff', fontWeight: 900 }}>
            Welcome to Kronos AI, {userName || 'Career Achiever'}!
          </h2>
          <p style={{ color: 'var(--accent-cyan)', fontSize: '14px', marginTop: '6px', fontWeight: 600 }}>
            We wish you great success in your career journey.
          </p>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Your Personal AI Career Assistant is online and configured to automate resume tailoring, job portal scanning, and recruiter outreach.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '13px', fontFamily: 'var(--font-code)' }}>
          <CheckCircle2 size={16} /> Autonomous Engine Initialized & Ready
        </div>

        <button className="btn-cyber" style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }} onClick={onClose}>
          Continue to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
