import React, { useState } from 'react';
import type { UserRole } from './RoleSelector';
import '../login/LoginForm.css';
import './Signup.css';

interface RegisterFormProps {
  role: UserRole;
  onSubmit: (data: { role: UserRole; email: string; password: string }) => void;
  onBack: () => void;
}

const roleLabels: Record<UserRole, string> = {
  diver: 'Diver',
  coach: 'Coach / Meet Director',
};

export default function RegisterForm({
  role,
  onSubmit,
  onBack,
}: RegisterFormProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    onSubmit({ role, email, password });
  };

  return (
    <>
      <p className="auth-subtitle">Creating a {roleLabels[role]} account</p>

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

      <button type="button" className="auth-secondary-btn" onClick={onBack}>
        Back to role selection
      </button>
    </>
  );
}
