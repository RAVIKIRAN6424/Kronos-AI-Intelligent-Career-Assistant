import React, { useState } from 'react';
import { Mail, KeyRound, User, Phone, CheckCircle2, X, Lock, ShieldCheck, Calendar, Clock, Globe } from 'lucide-react';
import { api } from '../utils/api';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, toast, initialMode = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'reset'

  // Register state
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('26');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [country, setCountry] = useState('India');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Email and password are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email, password });
      toast('Login successful! Welcome to Kronos AI.', 'success');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !password) {
      toast('Valid email and password are required.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.register({
        full_name: fullName,
        gender,
        age: parseInt(age),
        email,
        phone,
        country,
        password
      });
      toast(`Verification code dispatched to ${email}.`, 'success');
      setStep('otp');
    } catch (err) {
      toast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOTP = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      toast('Please enter the verification code sent to your email.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOTP({
        email,
        code: otpCode,
        full_name: fullName,
        age: parseInt(age),
        phone,
        target_domain: 'Software'
      });
      toast('Account created successfully!', 'success');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      toast(err.message || 'Invalid verification code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter your account email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(email);
      toast(`Reset verification code sent to ${email}.`, 'success');
      setStep('otp');
    } catch (err) {
      toast(err.message || 'Failed to send reset code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      toast('OTP code and new password are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({ email, code: otpCode, new_password: newPassword });
      toast('Password reset successfully! Please log in.', 'success');
      setActiveTab('login');
      setStep('form');
    } catch (err) {
      toast(err.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(2, 6, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '32px', borderRadius: '24px', position: 'relative', border: '1px solid var(--border-cyber)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(2, 6, 15, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => { setActiveTab('login'); setStep('form'); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'login' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'login' ? '#060a12' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Login
          </button>

          <button
            onClick={() => { setActiveTab('register'); setStep('form'); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'register' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'register' ? '#060a12' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>Sign In to Kronos AI</h2>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" className="cyber-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="alex.vance@kronos-ai.io" />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Password</label>
              <input type="password" className="cyber-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span onClick={() => { setActiveTab('forgot'); setStep('form'); }} style={{ color: 'var(--accent-cyan)', fontSize: '12px', cursor: 'pointer' }}>
                Forgot Password?
              </span>
            </div>

            <button className="btn-cyber" type="submit" disabled={loading} style={{ padding: '14px', justifyContent: 'center', fontSize: '15px' }}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && step === 'form' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>Create Account</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Full Name</label>
                <input className="cyber-input" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Alex Vance" />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gender</label>
                <select className="cyber-select" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Age</label>
                <input type="number" className="cyber-input" value={age} onChange={e => setAge(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Country</label>
                <input className="cyber-input" value={country} onChange={e => setCountry(e.target.value)} required />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" className="cyber-input" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone Number</label>
              <input className="cyber-input" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Password</label>
                <input type="password" className="cyber-input" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confirm Password</label>
                <input type="password" className="cyber-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', gap: '12px' }}>
              <span>📅 Date: {currentDate}</span>
              <span>⏰ Time: {currentTime}</span>
            </div>

            <button className="btn-cyber" type="submit" disabled={loading} style={{ padding: '14px', justifyContent: 'center', fontSize: '15px' }}>
              {loading ? 'Sending Verification Code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* VERIFY REGISTER OTP */}
        {activeTab === 'register' && step === 'otp' && (
          <form onSubmit={handleVerifyRegisterOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>Enter Email Verification Code</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Verification code dispatched only to <strong>{email}</strong>. (Code is never displayed on screen).
            </p>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>6-Digit Verification Code</label>
              <input className="cyber-input" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="123456" required style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }} />
            </div>

            <button className="btn-cyber" type="submit" disabled={loading} style={{ padding: '14px', justifyContent: 'center', fontSize: '15px' }}>
              {loading ? 'Verifying...' : 'Verify Code & Create Account'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {activeTab === 'forgot' && step === 'form' && (
          <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>Reset Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Enter your account email address to receive a secure password reset code.
            </p>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" className="cyber-input" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <button className="btn-cyber" type="submit" disabled={loading} style={{ padding: '14px', justifyContent: 'center' }}>
              {loading ? 'Sending Reset Code...' : 'Receive Reset OTP'}
            </button>
          </form>
        )}

        {activeTab === 'forgot' && step === 'otp' && (
          <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>Create New Password</h2>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verification Code</label>
              <input className="cyber-input" value={otpCode} onChange={e => setOtpCode(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>New Password</label>
              <input type="password" className="cyber-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>

            <button className="btn-cyber" type="submit" disabled={loading} style={{ padding: '14px', justifyContent: 'center' }}>
              {loading ? 'Resetting...' : 'Create New Password & Login'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
