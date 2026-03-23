import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelector from '../components/signup/RoleSelector';
import RegisterForm from '../components/signup/RegisterForm';
import type { UserRole } from '../components/signup/RoleSelector';
import '../components/login/LoginForm.css';

export default function RegisterPage(): React.ReactElement {
  const [role, setRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (data: {
    role: UserRole;
    email: string;
    password: string;
  }): void => {
    // TODO: replace with real register action
    // eslint-disable-next-line no-console
    console.log('Register submit', data);
    alert(`Register submitted as ${data.role} (demo)`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{role ? 'Register' : 'Register as'}</h1>

        {role ? (
          <RegisterForm
            role={role}
            onSubmit={handleSubmit}
            onBack={() => setRole(null)}
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
