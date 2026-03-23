import React, { useState } from 'react';
import './AuthPages.css';

interface LoginPageProps {
  onRegister?: () => void;
}

export default function LoginPage({
  onRegister,
}: LoginPageProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    // TODO: Replace with real authentication logic.
    // eslint-disable-next-line no-console
    console.log('Login submit', { email, password });
    alert('Login submitted (demo)');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-submit-btn" type="submit">
            Continue
          </button>
        </form>

        <p className="auth-switch-text">
          Don't have an account?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={onRegister}
          >
            Register!
          </button>
        </p>
      </div>
    </div>
  );
}
