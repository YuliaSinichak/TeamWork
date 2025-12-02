import React, { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/token/', {
        email,
        password,
      });
      auth?.login(response.data.access, response.data.refresh);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h1>
      <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: '2rem' }}>
        Sign in to access your resources
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-600)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
