import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/users/register/', {
        username,
        email,
        password,
        user_type: userType,
      });
      navigate('/login');
    } catch (error: any) {
      const errorMsg = error.response?.data;
      if (typeof errorMsg === 'object') {
        const messages = Object.values(errorMsg).flat();
        setError(messages.join(', '));
      } else {
        setError(errorMsg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        Create Account
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: '2rem' }}>
        Join our community and start sharing resources
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '1rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
            }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="input"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label className="form-label">I am a</label>
          <select className="select" value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-600)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
