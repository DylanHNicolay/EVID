import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm';
import { useAuth } from '../context/AuthContext';
import '../components/login/LoginForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

export default function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (credentials: {
    email: string;
    password: string;
  }): Promise<void> => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      login(data.token, data.user);
      navigate('/');
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        {error && <p className="auth-error">{error}</p>}
        <LoginForm onSubmit={handleSubmit} />

        <p className="auth-switch-text">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => navigate('/register')}
          >
            Register!
          </button>
        </p>
      </div>
    </div>
  );
}
