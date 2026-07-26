import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { api } from '../utils/api';

export function AuthModal({ isOpen, onClose, onAuthSuccess, toast }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'forgot'
  const [step, setStep] = useState('form'); // 'form', 'otp'
  
  const [countryCode, setCountryCode] = useState('+91');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const COUNTRY_CODES = [
    { code: '+91', label: '🇮🇳 +91 (India)' },
    { code: '+1', label: '🇺🇸 +1 (US/Canada)' },
    { code: '+44', label: '🇬🇧 +44 (UK)' },
    { code: '+61', label: '🇦🇺 +61 (Australia)' },
    { code: '+971', label: '🇦🇪 +971 (UAE)' },
    { code: '+49', label: '🇩🇪 +49 (Germany)' },
    { code: '+33', label: '🇫🇷 +33 (France)' },
    { code: '+65', label: '🇸🇬 +65 (Singapore)' },
    { code: '+81', label: '🇯🇵 +81 (Japan)' }
  ];

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toLocaleTimeString();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both your email address and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res && res.success === false) {
        toast(res.error || 'Invalid credentials', 'error');
        return;
      }
      toast('Login successful! Welcome to Kronos AI.', 'success');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (pass) => {
    if (!pass || pass.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least 1 uppercase letter (A-Z).';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least 1 lowercase letter (a-z).';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least 1 number (0-9).';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
      return 'Password must contain at least 1 special character (e.g. !@#$%^&*).';
    }
    return null;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !fullName.trim()) {
      toast('Please fill in your Full Name before requesting a verification code.', 'error');
      return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
      toast('Please fill in a valid Email Address before requesting a verification code.', 'error');
      return;
    }
    if (!phone || !phone.trim()) {
      toast('Please fill in your Phone Number before requesting a verification code.', 'error');
      return;
    }
    if (!password) {
      toast('Please enter a Password.', 'error');
      return;
    }

    const passErr = validatePassword(password);
    if (passErr) {
      toast(passErr, 'error');
      return;
    }

    if (password !== confirmPassword) {
      toast('Passwords do not match. Please re-type your password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOTP(email, fullName);
      if (res && res.success === false) {
        toast(res.error || 'Failed to dispatch verification code', 'error');
        return;
      }
      toast(`Verification OTP dispatched to ${email}! Please check your Inbox & Spam.`, 'success');
      setStep('otp');
      setCooldown(60);
    } catch (err) {
      toast(err.message || 'Failed to dispatch verification code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || !otpCode.trim()) {
      toast('Please enter the 6-digit verification code sent to your email.', 'error');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+') ? phone : `${countryCode} ${phone.trim()}`;
      const cleanEmailStr = typeof email === 'string' ? email.trim().toLowerCase() : '';
      const res = await api.verifyOTP({
        email: cleanEmailStr,
        code: otpCode.trim(),
        full_name: fullName,
        password
      });
      if (res && res.success === false) {
        toast(res.error || res.message || 'Invalid verification code. Please check your email code and try again.', 'error');
        return;
      }
      toast('Account created and verified successfully!', 'success');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      toast(err.message || 'Invalid verification code. Please check your code and try again.', 'error');
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
      const res = await api.forgotPassword(email);
      if (res && res.success === false) {
        toast(res.error || 'Failed to send reset code', 'error');
        return;
      }
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
      toast('Please enter the OTP code and your new password.', 'error');
      return;
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      toast(passErr, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ email, otp: otpCode, new_password: newPassword });
      if (res && res.success === false) {
        toast(res.error || 'Password reset failed', 'error');
        return;
      }
      toast('Password reset successfully! Please sign in with your new password.', 'success');
      setActiveTab('login');
      setStep('form');
    } catch (err) {
      toast(err.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(4, 8, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#081020',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0, 242, 254, 0.2)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="cyber-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
                <input className="cyber-input" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="e.g. Alex Vance" />
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
                <input type="number" className="cyber-input" value={age} onChange={e => setAge(e.target.value)} required placeholder="e.g. 26" />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Country</label>
                <input className="cyber-input" value={country} onChange={e => setCountry(e.target.value)} required placeholder="e.g. India" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" className="cyber-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="e.g. candidate@domain.com" />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="cyber-select"
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  style={{ width: '135px', flexShrink: 0, padding: '8px' }}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  className="cyber-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="e.g. 98765 43210"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Password (Mandatory 8+ Chars)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="cyber-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="e.g. Kronos#2026"
                    required
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="cyber-input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#00f2fe', background: 'rgba(0, 242, 254, 0.08)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.25)' }}>
              🔒 <strong>Password Requirements:</strong> Minimum 8 characters, at least 1 uppercase letter (A-Z), 1 lowercase letter (a-z), 1 number (0-9), and 1 special character (!@#$%^&*).
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
              Verification code dispatched only to <strong>{email}</strong>. (Code is sent to your Inbox & Spam).
            </p>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>6-Digit Verification Code</label>
              <input className="cyber-input" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="123456" required style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }} />
            </div>

            <button className="btn-cyber" type="submit" disabled={loading} style={{ padding: '14px', justifyContent: 'center', fontSize: '15px' }}>
              {loading ? 'Verifying OTP Code...' : 'Verify Code & Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-cyber-outline"
                disabled={cooldown > 0 || loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await api.resendOTP(email, fullName);
                    if (res && res.success === false) {
                      toast(res.error || 'Resend failed', 'error');
                      return;
                    }
                    toast(`New verification code sent to ${email}`, 'success');
                    setCooldown(60);
                  } catch (err) {
                    toast(err.message || 'Resend failed', 'error');
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{ fontSize: '13px', padding: '8px 16px', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', opacity: cooldown > 0 ? 0.6 : 1 }}
              >
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : '🔄 Resend Verification Code'}
              </button>
            </div>
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
              <input type="email" className="cyber-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="6424ravikiran@gmail.com" />
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
              <input className="cyber-input" value={otpCode} onChange={e => setOtpCode(e.target.value)} required placeholder="123456" />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="cyber-input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn-cyber" type="submit" disabled={loading} style={{ padding: '14px', justifyContent: 'center' }}>
              {loading ? 'Resetting...' : 'Create New Password & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
