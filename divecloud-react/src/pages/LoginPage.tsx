import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm';
import '../components/login/LoginForm.css';

export default function LoginPage(): React.ReactElement {
  const navigate = useNavigate();

  const handleSubmit = (credentials: {
    email: string;
    password: string;
  }): void => {
    // TODO: Replace with real authentication logic.
    // eslint-disable-next-line no-console
    console.log('Login submit', credentials);
    alert('Login submitted (demo)');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <LoginForm onSubmit={handleSubmit} />

        <p className="auth-switch-text">
          Don't have an account?{' '}
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
