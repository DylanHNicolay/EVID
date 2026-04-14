import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileMediaTab from '../components/profile/ProfileMediaTab';
import './EditProfilePage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

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

export default function EditProfilePage(): React.ReactElement {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('Profile');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const controller = new AbortController();
    const fetchProfile = async (): Promise<void> => {
      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchProfile();
    return (): void => {
      controller.abort();
    };
  }, [authLoading, isAuthenticated, user, token]);

  const handleSave = async (
    updatedProfile: Partial<UserProfile>
  ): Promise<void> => {
    try {
      setError('');
      setSuccess('');
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedData = await response.json();
      setProfile(updatedData);
      setSuccess('Profile updated successfully!');

      // Hard refresh to fetch latest data from API
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="edit-profile-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="edit-profile-page">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <div className="edit-profile-title">
          <h1>
            {profile.first_name} {profile.last_name}
          </h1>
          <button
            className="view-profile-btn"
            onClick={() => navigate(`/profile`)}
          >
            View Profile
          </button>
        </div>
      </div>

      {error && <div className="edit-profile-error">{error}</div>}
      {success && <div className="edit-profile-success">{success}</div>}

      {/* Tabs */}
      <div className="edit-profile-tabs">
        <button
          className={`edit-profile-tab ${activeTab === 'Profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('Profile')}
        >
          Profile
        </button>
        <button
          className={`edit-profile-tab ${activeTab === 'Photo' ? 'active' : ''}`}
          onClick={() => setActiveTab('Photo')}
        >
          Photo
        </button>
        <button
          className={`edit-profile-tab ${activeTab === 'Video' ? 'active' : ''}`}
          onClick={() => setActiveTab('Video')}
        >
          Video
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'Profile' && (
        <ProfileEditForm
          profile={profile}
          onSave={handleSave}
          onCancel={() => navigate(`/profile`)}
        />
      )}

      {activeTab === 'Photo' && (
        <ProfileMediaTab
          type="photo"
          userId={user?.id || 0}
          athleteId={user?.athlete_id || 0}
          onCancel={() => navigate(`/profile`)}
        />
      )}

      {activeTab === 'Video' && (
        <ProfileMediaTab
          type="video"
          userId={user?.id || 0}
          athleteId={user?.athlete_id || 0}
          onCancel={() => navigate(`/profile`)}
        />
      )}
    </div>
  );
}
