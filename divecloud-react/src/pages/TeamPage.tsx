import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TeamPageCard from '../components/teams/TeamPageCard';
import TeamHomeTab from '../components/teams/tabs/team-home-tab';
import TeamMeetsTab from '../components/teams/tabs/team-meets-tab';
import TeamRosterTab from '../components/teams/tabs/team-roster-tab';
import TeamResultsUploadTab from '../components/teams/tabs/team-results-upload-tab';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface TeamInfo {
  id: number;
  name: string;
  abbreviation: string | null;
  school: string | null;
  division: string | null;
  conference: string | null;
  location: string | null;
  logo_url: string | null;
  banner_url: string | null;
  accent_color: string | null;
}

export default function TeamPage(): React.ReactElement {
  const { teamId: paramId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');
  const [team, setTeam] = useState<TeamInfo | null>(null);

  const teamId = paramId;
  const canUploadResults =
    !!user &&
    (user.role === 'admin' ||
      (user.role === 'coach' &&
        !!user.team_id &&
        !!team &&
        Number(user.team_id) === Number(team.id)));
  const tabs = useMemo(
    () =>
      canUploadResults
        ? ['Home', 'Meets', 'Roster', 'Upload Results']
        : ['Home', 'Meets', 'Roster'],
    [canUploadResults]
  );

  useEffect(() => {
    if (!teamId) return;
    const controller = new AbortController();
    fetch(`${API_URL}/api/teams/${teamId}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Team not found');
        return r.json();
      })
      .then(setTeam)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return (): void => {
      controller.abort();
    };
  }, [teamId, user]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab('Home');
    }
  }, [activeTab, tabs]);

  if (!teamId) {
    return (
      <div className="team-page-error">
        <p>No team specified</p>
      </div>
    );
  }

  if (!team) return <div className="team-page-loading">Loading...</div>;

  return (
    <>
      <TeamPageCard
        teamName={team.name}
        division={team.division || ''}
        conference={team.conference || ''}
        bannerUrl={team.banner_url || undefined}
        logoUrl={team.logo_url || undefined}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {activeTab === 'Home' && <TeamHomeTab team={team} />}
      {activeTab === 'Meets' && <TeamMeetsTab teamId={team.id} />}
      {activeTab === 'Roster' && <TeamRosterTab teamId={team.id} />}
      {activeTab === 'Upload Results' && canUploadResults && (
        <TeamResultsUploadTab teamId={team.id} />
      )}
    </>
  );
}
