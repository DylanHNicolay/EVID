import React, { useState } from 'react';
import './AuthPages.css';

interface RegisterPageProps {
  onLogin?: () => void;
}

type UserRole = 'diver' | 'coach' | null;

export default function RegisterPage({
  onLogin,
}: RegisterPageProps): React.ReactElement {
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    // TODO: replace with real register action
    // eslint-disable-next-line no-console
    console.log('Register submit', { role, email, password });
    alert(`Register submitted as ${role || 'unknown'} (demo)`);
  };

  const renderRoleSelection = (): React.ReactElement => (
    <>
      <p className="auth-subtitle">Select an account type to continue</p>

      <div className="role-grid">
        <button
          type="button"
          className="role-card"
          onClick={() => setRole('diver')}
        >
          <strong>Diver</strong>
          <span>Register as a diver</span>
        </button>

        <button
          type="button"
          className="role-card"
          onClick={() => setRole('coach')}
        >
          <strong>Coach / Meet Director</strong>
          <span>Register as a coach</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{role ? 'Register' : 'Register as'}</h1>

        {role ? (
          <>
            <p className="auth-subtitle">
              Creating a {role === 'diver' ? 'Diver' : 'Coach / Meet Director'}{' '}
              account
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button className="auth-submit-btn" type="submit">
                Continue
              </button>
            </form>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => setRole(null)}
            >
              Back to role selection
            </button>
          </>
        ) : (
          renderRoleSelection()
        )}

        <p className="auth-switch-text">
          Already have an account?{' '}
          <button type="button" className="auth-switch-link" onClick={onLogin}>
            login
          </button>
        </p>
      </div>
    </div>
  );
}
