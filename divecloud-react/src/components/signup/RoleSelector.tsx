import React from 'react';
import './Signup.css';

export type UserRole = 'diver' | 'coach';

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelector({
  onRoleSelect,
}: RoleSelectorProps): React.ReactElement {
  return (
    <>
      <p className="auth-subtitle">Select an account type to continue</p>

      <div className="role-grid">
        <button
          type="button"
          className="role-card"
          onClick={() => onRoleSelect('diver')}
        >
          <strong>Diver</strong>
          <span>Register as a diver</span>
        </button>

        <button
          type="button"
          className="role-card"
          onClick={() => onRoleSelect('coach')}
        >
          <strong>Coach / Meet Director</strong>
          <span>Register as a coach</span>
        </button>
      </div>
    </>
  );
}
