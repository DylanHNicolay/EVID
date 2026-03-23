import React, { useState } from 'react';
import type { UserRole } from './RoleSelector';
import '../login/LoginForm.css';
import './Signup.css';

export interface RegisterPayload {
  role: UserRole;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface RegisterFormProps {
  role: UserRole;
  onSubmit: (data: RegisterPayload) => void;
  onBack: () => void;
  error?: string;
}

const roleLabels: Record<UserRole, string> = {
  diver: 'Diver',
  coach: 'Coach / Meet Director',
};

export default function RegisterForm({
  role,
  onSubmit,
  onBack,
  error,
}: RegisterFormProps): React.ReactElement {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    onSubmit({ role, email, password, firstName, lastName });
  };

  return (
    <>
      <p className="auth-subtitle">Creating a {roleLabels[role]} account</p>

      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register-first">First Name</label>
        <input
          id="register-first"
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e): void => setFirstName(e.target.value)}
          required
        />

        <label htmlFor="register-last">Last Name</label>
        <input
          id="register-last"
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e): void => setLastName(e.target.value)}
          required
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e): void => setEmail(e.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e): void => setPassword(e.target.value)}
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
