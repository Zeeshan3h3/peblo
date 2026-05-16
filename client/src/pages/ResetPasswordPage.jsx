import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

const LEFT_PILLS = ['Secure Recovery', 'Encrypted OTP', 'Safe', 'Reliable'];

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await axiosInstance.post('/auth/reset-password', { email, newPassword });
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in with your new password.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = {
    display: 'block', marginBottom: 6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11, fontWeight: 700,
    letterSpacing: '0.07em', textTransform: 'uppercase',
    color: '#6B7280',
  };

  const inputStyle = {
    width: '100%', height: 44, padding: '0 14px',
    background: '#F8F7F4',
    border: '1.5px solid #E5E3DF',
    borderRadius: 11,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14, color: '#1C1C1E',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  return (
    <div className="flex min-h-screen page-enter">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E0A3C 0%, #2D1060 50%, #1E0A3C 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', top: '10%', right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 32, maxWidth: 320, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
            <img src="/peblo_logo.png" alt="Peblo Logo" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
            <span style={{ color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 600 }}>Notes</span>
          </div>
          <blockquote style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 24 }}>
            "Security is not a product, but a process."
          </blockquote>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {LEFT_PILLS.map(p => (
              <span key={p} style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 20, padding: '5px 14px', fontFamily: "'Plus Jakarta Sans'", fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{p}</span>
            ))}
          </div>
          <p style={{ marginTop: 32, fontFamily: "'Plus Jakarta Sans'", fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            Built for Peblo's Developer Challenge · 2026
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col items-center justify-center flex-1 px-6" style={{ background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/peblo_logo.png" alt="Peblo Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#1C1C1E' }}>Notes</span>
          </div>

          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: '#1C1C1E', marginBottom: 4 }}>Set new password</h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Please enter your new password below.</p>

          <div style={{ background: 'white', border: '1px solid #E5E3DF', borderRadius: 20, padding: 36, boxShadow: 'var(--shadow-xl)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="reset-new-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E3DF'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, padding: 4, color: '#9CA3AF', cursor: 'pointer', fontSize: 15 }}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="reset-confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E3DF'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, padding: 4, color: '#9CA3AF', cursor: 'pointer', fontSize: 15 }}>
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-peblo-lg" style={{ marginTop: 8 }}>
                {isSubmitting ? <><span className="spinner" /> Resetting...</> : 'Reset Password'}
              </button>

              {error && (
                <div style={{ marginTop: 12, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-exclamation-circle-fill" style={{ color: '#DC2626', fontSize: 14 }} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 13, color: '#DC2626' }}>{error}</span>
                </div>
              )}
            </form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E3DF' }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 12, fontWeight: 500, color: '#9CA3AF' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E5E3DF' }} />
          </div>

          <p style={{ textAlign: 'center', fontFamily: "'Plus Jakarta Sans'", fontSize: 14, color: '#6B7280' }}>
            <Link to="/login" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Cancel and back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
