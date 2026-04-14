import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileHomeTab from '../components/profile/tabs/profile-home-tab';
import ProfileScoresTab from '../components/profile/tabs/profile-scores-tab';
import ProfileMeetsTab from '../components/profile/tabs/profile-meets-tab';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface AthleteProfile {
  id: number;
  first_name: string;
  last_name: string;
  hometown: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  team_id: number | null;
  team_name: string | null;
}

export default function ProfilePage(): React.ReactElement {
  const { athleteId: paramId } = useParams<{ athleteId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const athleteId =
    paramId || (user?.athlete_id ? String(user.athlete_id) : null);

  const isOwnProfile =
    isAuthenticated &&
    user?.athlete_id != null &&
    athlete != null &&
    user.athlete_id === athlete.id;

  useEffect(() => {
    if (authLoading) return;

    if (!paramId && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (!athleteId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetch(`${API_URL}/api/athletes/${athleteId}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) {
          throw new Error('Failed to fetch athlete');
        }
        return r.json();
      })
      .then((data) => {
        setAthlete(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching athlete:', err);
        setLoading(false);
      });
    return (): void => {
      controller.abort();
    };
  }, [athleteId, paramId, isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className="profile-page-loading">Loading...</div>;
  }

  if (!athlete) {
    return (
      <div className="profile-page-error">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div>
      <ProfileCard
        firstName={athlete.first_name}
        lastName={athlete.last_name}
        location={athlete.hometown || athlete.location || ''}
        team={athlete.team_name || ''}
        avatarUrl={athlete.avatar_url || undefined}
        bannerUrl={athlete.banner_url || undefined}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => navigate('/profile/edit')}
      />

      {activeTab === 'Home' && <ProfileHomeTab athleteId={athlete.id} />}
      {activeTab === 'Meets' && <ProfileMeetsTab athleteId={athlete.id} />}
      {activeTab === 'Scores' && <ProfileScoresTab athleteId={athlete.id} />}
    </div>
  );
}
