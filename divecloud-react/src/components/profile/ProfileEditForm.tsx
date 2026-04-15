import React, { useState } from 'react';
import './ProfileEditForm.css';

interface UserProfile {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  date_of_birth?: string;
  gender?: string;
  preferred_first_name?: string;
  uss_number?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  athlete_hometown?: string;
  athlete_graduation_year?: number;
  athlete_bio?: string;
  athlete_gender?: string;
}

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

export default function ProfileEditForm({
  profile,
  onSave,
  onCancel,
}: ProfileEditFormProps): React.ReactElement {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    first_name: profile.first_name,
    middle_initial: profile.middle_initial || '',
    last_name: profile.last_name,
    preferred_first_name: profile.preferred_first_name || '',
    date_of_birth: profile.date_of_birth || '',
    gender: profile.gender || '',
    uss_number: profile.uss_number || '',
    avatar_url: profile.avatar_url || '',
    banner_url: profile.banner_url || '',
    location: profile.location || '',
    athlete_hometown: profile.athlete_hometown || '',
    athlete_graduation_year: profile.athlete_graduation_year || undefined,
    athlete_bio: profile.athlete_bio || '',
    athlete_gender: profile.athlete_gender || '',
  });

  const isAthlete = profile.role === 'athlete';
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (formData.middle_initial && formData.middle_initial.length > 1) {
      newErrors.middle_initial = 'Middle initial must be a single character';
    }
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 10 || age > 100) {
        newErrors.date_of_birth = 'Please enter a valid date of birth';
      }
    }
    const gradYear = formData.athlete_graduation_year;
    if (gradYear !== undefined && gradYear !== null) {
      if (gradYear < 1980 || gradYear > 2100) {
        newErrors.athlete_graduation_year = 'Must be between 1980 and 2100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'athlete_graduation_year'
          ? value
            ? parseInt(value, 10)
            : undefined
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-edit-form-container">
      <div className="profile-edit-card">
        <form onSubmit={handleSubmit} className="profile-edit-form">
          {/* Images Section */}
          <div className="profile-edit-section">
            <h2 className="profile-edit-section-title">Profile Images</h2>
            <div className="profile-edit-row">
              <div className="profile-edit-group profile-edit-group--image">
                <label htmlFor="avatar_url" className="profile-edit-label">
                  Profile Picture URL
                </label>
                <div className="profile-edit-image-field">
                  {formData.avatar_url && (
                    <img
                      src={formData.avatar_url}
                      alt="Avatar preview"
                      className="profile-edit-preview profile-edit-preview--avatar"
                    />
                  )}
                  <input
                    id="avatar_url"
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url || ''}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
              <div className="profile-edit-group profile-edit-group--image">
                <label htmlFor="banner_url" className="profile-edit-label">
                  Banner Image URL
                </label>
                <div className="profile-edit-image-field">
                  {formData.banner_url && (
                    <img
                      src={formData.banner_url}
                      alt="Banner preview"
                      className="profile-edit-preview profile-edit-preview--banner"
                    />
                  )}
                  <input
                    id="banner_url"
                    type="url"
                    name="banner_url"
                    value={formData.banner_url || ''}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="profile-edit-section">
            <h2 className="profile-edit-section-title">About you</h2>

            <div className="profile-edit-row">
              <div className="profile-edit-group">
                <label htmlFor="first_name" className="profile-edit-label">
                  First name
                </label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  className={`profile-edit-input ${errors.first_name ? 'error' : ''}`}
                />
                {errors.first_name && (
                  <span className="profile-edit-error-text">
                    {errors.first_name}
                  </span>
                )}
              </div>

              <div className="profile-edit-group">
                <label htmlFor="middle_initial" className="profile-edit-label">
                  Middle initial
                </label>
                <input
                  id="middle_initial"
                  type="text"
                  name="middle_initial"
                  maxLength={1}
                  value={formData.middle_initial || ''}
                  onChange={handleInputChange}
                  className={`profile-edit-input middle ${errors.middle_initial ? 'error' : ''}`}
                />
                {errors.middle_initial && (
                  <span className="profile-edit-error-text">
                    {errors.middle_initial}
                  </span>
                )}
              </div>

              <div className="profile-edit-group">
                <label htmlFor="last_name" className="profile-edit-label">
                  Last name
                </label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  className={`profile-edit-input ${errors.last_name ? 'error' : ''}`}
                />
                {errors.last_name && (
                  <span className="profile-edit-error-text">
                    {errors.last_name}
                  </span>
                )}
              </div>

              <div className="profile-edit-group">
                <label htmlFor="uss_number" className="profile-edit-label">
                  USS Number
                </label>
                <input
                  id="uss_number"
                  type="text"
                  name="uss_number"
                  value={formData.uss_number || ''}
                  onChange={handleInputChange}
                  className="profile-edit-input"
                />
              </div>
            </div>

            <div className="profile-edit-row">
              <div className="profile-edit-group">
                <label
                  htmlFor="preferred_first_name"
                  className="profile-edit-label"
                >
                  Preferred First Name
                </label>
                <input
                  id="preferred_first_name"
                  type="text"
                  name="preferred_first_name"
                  value={formData.preferred_first_name || ''}
                  onChange={handleInputChange}
                  className="profile-edit-input"
                />
              </div>

              <div className="profile-edit-group">
                <label htmlFor="date_of_birth" className="profile-edit-label">
                  Date of birth
                </label>
                <input
                  id="date_of_birth"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={handleInputChange}
                  className={`profile-edit-input ${errors.date_of_birth ? 'error' : ''}`}
                />
                {errors.date_of_birth && (
                  <span className="profile-edit-error-text">
                    {errors.date_of_birth}
                  </span>
                )}
              </div>

              <div className="profile-edit-group">
                <label htmlFor="gender" className="profile-edit-label">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="profile-edit-input"
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div className="profile-edit-group">
                <label htmlFor="location" className="profile-edit-label">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="profile-edit-input"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {/* Athlete Section */}
          {isAthlete && (
            <div className="profile-edit-section">
              <h2 className="profile-edit-section-title">Athlete Info</h2>

              <div className="profile-edit-row">
                <div className="profile-edit-group">
                  <label
                    htmlFor="athlete_gender"
                    className="profile-edit-label"
                  >
                    Competition Category
                  </label>
                  <select
                    id="athlete_gender"
                    name="athlete_gender"
                    value={formData.athlete_gender || ''}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                  >
                    <option value="">Select category</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>

                <div className="profile-edit-group">
                  <label
                    htmlFor="athlete_hometown"
                    className="profile-edit-label"
                  >
                    Hometown
                  </label>
                  <input
                    id="athlete_hometown"
                    type="text"
                    name="athlete_hometown"
                    value={formData.athlete_hometown || ''}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="City, State"
                  />
                </div>

                <div className="profile-edit-group">
                  <label
                    htmlFor="athlete_graduation_year"
                    className="profile-edit-label"
                  >
                    Graduation Year
                  </label>
                  <input
                    id="athlete_graduation_year"
                    type="number"
                    name="athlete_graduation_year"
                    min={1980}
                    max={2100}
                    value={formData.athlete_graduation_year || ''}
                    onChange={handleInputChange}
                    className={`profile-edit-input ${errors.athlete_graduation_year ? 'error' : ''}`}
                  />
                  {errors.athlete_graduation_year && (
                    <span className="profile-edit-error-text">
                      {errors.athlete_graduation_year}
                    </span>
                  )}
                </div>
              </div>

              <div className="profile-edit-group">
                <label htmlFor="athlete_bio" className="profile-edit-label">
                  Bio
                </label>
                <textarea
                  id="athlete_bio"
                  name="athlete_bio"
                  rows={4}
                  value={formData.athlete_bio || ''}
                  onChange={handleInputChange}
                  className="profile-edit-input profile-edit-textarea"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="profile-edit-actions">
            <button
              type="button"
              className="profile-edit-button cancel"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-edit-button save"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
