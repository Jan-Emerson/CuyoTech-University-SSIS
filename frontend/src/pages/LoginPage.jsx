import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { IconEye, IconEyeOff, IconSchool } from '../components/Icons.jsx';

export default function LoginPage() {
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword]           = useState('');
  const [showPw, setShowPw]               = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!studentNumber.trim()) { setError('Please enter your Student ID Number.'); return; }
    if (!password)              { setError('Please enter your password.');           return; }

    setLoading(true);
    try {
      await login(studentNumber.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <IconSchool size={38} />
        </div>

        <p className="login-university">University of CuyoTech</p>
        <p className="login-subtitle">STUDENT SERVICES INFORMATION SYSTEM (SSIS)</p>
        <p className="login-heading">STUDENT LOGIN</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
          {/* Student ID */}
          <div className="form-group">
            <label htmlFor="sid">Student ID Number</label>
            <input
              id="sid"
              type="text"
              className="form-control"
              placeholder="Student ID Number"
              value={studentNumber}
              onChange={e => setStudentNumber(e.target.value)}
              autoComplete="username"
              aria-label="Student ID Number"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="pw">Password</label>
            <div className="input-pw-wrap">
              <input
                id="pw"
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-label="Password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'LOGIN'}
          </button>
        </form>

        <div className="login-links" style={{ marginTop: '14px' }}>
          <a href="#" onClick={e => e.preventDefault()}>Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}
