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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);

  const athleteId =
    paramId || (user?.athlete_id ? String(user.athlete_id) : null);

  const isOwnProfile =
    isAuthenticated &&
    user?.athlete_id != null &&
    athlete != null &&
    user.athlete_id === athlete.id;

  // #region agent log
  fetch('http://127.0.0.1:7509/ingest/3339ea9c-7f45-41b9-a88d-8b348632910c', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '68e3ce',
    },
    body: JSON.stringify({
      sessionId: '68e3ce',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location: 'profilePage.tsx:32',
      message: 'ProfilePage render',
      data: {
        paramId: paramId || null,
        userAthleteId: user?.athlete_id,
        userId: user?.id,
        userRole: user?.role,
        computedAthleteId: athleteId,
        isAuthenticated,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  useEffect(() => {
    if (!paramId && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (!athleteId) return;

    // #region agent log
    fetch('http://127.0.0.1:7509/ingest/3339ea9c-7f45-41b9-a88d-8b348632910c', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '68e3ce',
      },
      body: JSON.stringify({
        sessionId: '68e3ce',
        runId: 'pre-fix',
        hypothesisId: 'H4',
        location: 'profilePage.tsx:useEffect',
        message: 'Fetching athlete',
        data: { athleteId, url: `${API_URL}/api/athletes/${athleteId}` },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    fetch(`${API_URL}/api/athletes/${athleteId}`)
      .then((r) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7509/ingest/3339ea9c-7f45-41b9-a88d-8b348632910c',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '68e3ce',
            },
            body: JSON.stringify({
              sessionId: '68e3ce',
              runId: 'pre-fix',
              hypothesisId: 'H4',
              location: 'profilePage.tsx:fetchResponse',
              message: 'Athlete API response',
              data: { status: r.status, ok: r.ok },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
        // #endregion
        return r.json();
      })
      .then((data) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7509/ingest/3339ea9c-7f45-41b9-a88d-8b348632910c',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '68e3ce',
            },
            body: JSON.stringify({
              sessionId: '68e3ce',
              runId: 'pre-fix',
              hypothesisId: 'H5',
              location: 'profilePage.tsx:setAthlete',
              message: 'Setting athlete data',
              data: {
                hasData: !!data,
                keys: data ? Object.keys(data) : null,
                firstName: data?.first_name,
                id: data?.id,
              },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
        // #endregion
        setAthlete(data);
      })
      .catch((err) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7509/ingest/3339ea9c-7f45-41b9-a88d-8b348632910c',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '68e3ce',
            },
            body: JSON.stringify({
              sessionId: '68e3ce',
              runId: 'pre-fix',
              hypothesisId: 'H6',
              location: 'profilePage.tsx:fetchError',
              message: 'Athlete fetch error',
              data: { error: String(err) },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
        // #endregion
        console.error(err);
      });
  }, [athleteId, paramId, isAuthenticated, navigate]);

  if (!athlete) {
    return <div />;
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
        onEditProfile={() => navigate(`/profile/${athlete.id}/edit`)}
      />

      {activeTab === 'Home' && <ProfileHomeTab athleteId={athlete.id} />}
      {activeTab === 'Meets' && <ProfileMeetsTab athleteId={athlete.id} />}
      {activeTab === 'Scores' && <ProfileScoresTab athleteId={athlete.id} />}
    </div>
  );
}
