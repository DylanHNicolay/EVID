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
  middleInitial?: string;
  gender?: string;
  dateOfBirth?: string;
  preferredFirstName?: string;
  ussNumber?: string;
  graduationYear?: number;
  hometown?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

interface RegisterFormProps {
  role: UserRole;
  onSubmit: (data: RegisterPayload) => Promise<void>;
  onBack: () => void;
  error?: string;
}

const roleLabels: Record<UserRole, string> = {
  diver: 'Diver',
  coach: 'Coach / Meet Director',
};

const currentYear = new Date().getFullYear();

export default function RegisterForm({
  role,
  onSubmit,
  onBack,
  error,
}: RegisterFormProps): React.ReactElement {
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredFirstName, setPreferredFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [hometown, setHometown] = useState('');
  const [ussNumber, setUssNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (): void => setValidationError('');

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setValidationError('');

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setValidationError('First name, last name, email, and password are required');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (!gender) {
      setValidationError('Please select a gender');
      return;
    }

    if (middleInitial.length > 1) {
      setValidationError('Middle initial must be a single character');
      return;
    }

    const gradYear = graduationYear ? parseInt(graduationYear, 10) : undefined;
    if (gradYear !== undefined && (gradYear < 1980 || gradYear > 2100)) {
      setValidationError('Graduation year must be between 1980 and 2100');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        role,
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleInitial: middleInitial.trim() || undefined,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        preferredFirstName: preferredFirstName.trim() || undefined,
        ussNumber: ussNumber.trim() || undefined,
        graduationYear: gradYear,
        hometown: hometown.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <p className="auth-subtitle">Creating a {roleLabels[role]} account</p>

      {(error || validationError) && (
        <p className="auth-error">{error || validationError}</p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <p className="auth-form-section">Name</p>

        <div className="auth-form-row">
          <div className="auth-form-group auth-form-group--grow">
            <label htmlFor="register-first">First Name *</label>
            <input
              id="register-first"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e): void => { setFirstName(e.target.value); clearError(); }}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="auth-form-group auth-form-group--narrow">
            <label htmlFor="register-mi">M.I.</label>
            <input
              id="register-mi"
              type="text"
              placeholder="M"
              maxLength={1}
              value={middleInitial}
              onChange={(e): void => { setMiddleInitial(e.target.value); clearError(); }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <label htmlFor="register-last">Last Name *</label>
        <input
          id="register-last"
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e): void => { setLastName(e.target.value); clearError(); }}
          disabled={isSubmitting}
          required
        />

        {role === 'diver' && (
          <>
            <label htmlFor="register-preferred">Preferred First Name</label>
            <input
              id="register-preferred"
              type="text"
              placeholder="Nickname or preferred name"
              value={preferredFirstName}
              onChange={(e): void => { setPreferredFirstName(e.target.value); clearError(); }}
              disabled={isSubmitting}
            />
          </>
        )}

        <p className="auth-form-section">Account</p>

        <label htmlFor="register-email">Email *</label>
        <input
          id="register-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e): void => { setEmail(e.target.value); clearError(); }}
          disabled={isSubmitting}
          required
        />

        <label htmlFor="register-password">Password *</label>
        <input
          id="register-password"
          type="password"
          placeholder="Create a password (min. 6 characters)"
          value={password}
          onChange={(e): void => { setPassword(e.target.value); clearError(); }}
          disabled={isSubmitting}
          required
        />

        <p className="auth-form-section">Personal Info</p>

        <label htmlFor="register-gender">Gender *</label>
        <select
          id="register-gender"
          value={gender}
          onChange={(e): void => { setGender(e.target.value); clearError(); }}
          disabled={isSubmitting}
          required
        >
          <option value="">Select gender</option>
          <option value="men">Male</option>
          <option value="women">Female</option>
        </select>

        <label htmlFor="register-dob">Date of Birth</label>
        <input
          id="register-dob"
          type="date"
          value={dateOfBirth}
          onChange={(e): void => { setDateOfBirth(e.target.value); clearError(); }}
          disabled={isSubmitting}
        />

        {role === 'diver' && (
          <>
            <div className="auth-form-row">
              <div className="auth-form-group auth-form-group--grow">
                <label htmlFor="register-hometown">Hometown</label>
                <input
                  id="register-hometown"
                  type="text"
                  placeholder="City, State"
                  value={hometown}
                  onChange={(e): void => { setHometown(e.target.value); clearError(); }}
                  disabled={isSubmitting}
                />
              </div>
              <div className="auth-form-group auth-form-group--narrow-med">
                <label htmlFor="register-grad">Grad Year</label>
                <input
                  id="register-grad"
                  type="number"
                  placeholder={String(currentYear)}
                  min={1980}
                  max={2100}
                  value={graduationYear}
                  onChange={(e): void => { setGraduationYear(e.target.value); clearError(); }}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <label htmlFor="register-uss">USS Number</label>
            <input
              id="register-uss"
              type="text"
              placeholder="USA Diving membership number"
              value={ussNumber}
              onChange={(e): void => { setUssNumber(e.target.value); clearError(); }}
              disabled={isSubmitting}
            />
          </>
        )}

        <p className="auth-form-section">Profile Images</p>
        <p className="auth-form-hint">
          Paste a URL to an image. If left blank, defaults will be used.
        </p>

        <label htmlFor="register-avatar">Profile Picture URL</label>
        <input
          id="register-avatar"
          type="url"
          placeholder="https://example.com/photo.jpg"
          value={avatarUrl}
          onChange={(e): void => { setAvatarUrl(e.target.value); clearError(); }}
          disabled={isSubmitting}
        />

        {role === 'diver' && (
          <>
            <label htmlFor="register-banner">Banner Image URL</label>
            <input
              id="register-banner"
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={bannerUrl}
              onChange={(e): void => { setBannerUrl(e.target.value); clearError(); }}
              disabled={isSubmitting}
            />
          </>
        )}

        <button
          className="auth-submit-btn"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <button
        type="button"
        className="auth-secondary-btn"
        onClick={onBack}
        disabled={isSubmitting}
      >
        Back to role selection
      </button>
    </>
  );
}
