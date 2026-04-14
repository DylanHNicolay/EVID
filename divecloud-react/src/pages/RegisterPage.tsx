import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelector from '../components/signup/RoleSelector';
import RegisterForm from '../components/signup/RegisterForm';
import type { UserRole } from '../components/signup/RoleSelector';
import type { RegisterPayload } from '../components/signup/RegisterForm';
import { useAuth } from '../context/AuthContext';
import '../components/login/LoginForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

export default function RegisterPage(): React.ReactElement {
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const justRegistered = useRef(false);

  if (isAuthenticated && !justRegistered.current) {
    navigate('/', { replace: true });
  }

  const handleSubmit = async (data: RegisterPayload): Promise<void> => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Registration failed');
        return;
      }
      justRegistered.current = true;
      login(json.token, json.user);
      navigate(data.role === 'diver' ? '/profile' : '/');
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <h1>{role ? 'Register' : 'Register as'}</h1>

        {role ? (
          <RegisterForm
            role={role}
            onSubmit={handleSubmit}
            onBack={(): void => setRole(null)}
            error={error}
          />
        ) : (
          <RoleSelector onRoleSelect={setRole} />
        )}

        <p className="auth-switch-text">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => navigate('/login')}
          >
            login
          </button>
        </p>
      </div>
    </div>
  );
}
