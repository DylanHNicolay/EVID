import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TeamPageCard from '../components/teams/TeamPageCard';
import TeamHomeTab from '../components/teams/tabs/team-home-tab';
import TeamMeetsTab from '../components/teams/tabs/team-meets-tab';
import TeamRosterTab from '../components/teams/tabs/team-roster-tab';
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

  const teamId = paramId || '1';

  useEffect(() => {
    fetch(`${API_URL}/api/teams/${teamId}`)
      .then((r) => r.json())
      .then(setTeam)
      .catch(console.error);
  }, [teamId, user]);

  if (!team) return <div />;

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
      />

      {activeTab === 'Home' && <TeamHomeTab team={team} />}
      {activeTab === 'Meets' && <TeamMeetsTab teamId={team.id} />}
      {activeTab === 'Roster' && <TeamRosterTab teamId={team.id} />}
    </>
  );
}
