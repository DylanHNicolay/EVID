import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MeetPageCard from '../components/meet-detail/MeetPageCard';
import MeetTeamsScore from '../components/meet-detail/MeetTeamsScore';
import MeetResultsTable from '../components/meet-detail/MeetResultsTable';
import './MeetPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface MeetInfo {
  id: number;
  name: string;
  meet_date: string;
  date_end: string | null;
  location: string;
  status: string;
  logo_url: string | null;
}

interface TeamRow {
  team_id: number;
  name: string;
  logo_url: string | null;
  team_score: number;
}

interface ResultRow {
  id: number;
  name: string;
  team: string;
  event: string;
  score: number;
  points: number;
}

function formatDate(raw: string): string {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusLabel(s: string): 'Completed' | 'Upcoming' {
  return s === 'completed' ? 'Completed' : 'Upcoming';
}

export default function MeetPage(): React.ReactElement {
  const { meetId } = useParams<{ meetId: string }>();
  const [gender, setGender] = useState<'men' | 'women'>('men');

  const [meet, setMeet] = useState<MeetInfo | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);

  useEffect(() => {
    if (!meetId) return;
    fetch(`${API_URL}/api/meets/${meetId}`)
      .then((r) => r.json())
      .then(setMeet)
      .catch(console.error);
  }, [meetId]);

  useEffect(() => {
    if (!meetId) return;
    fetch(`${API_URL}/api/meets/${meetId}/teams?gender=${gender}`)
      .then((r) => r.json())
      .then(setTeams)
      .catch(console.error);

    fetch(`${API_URL}/api/meets/${meetId}/results?gender=${gender}`)
      .then((r) => r.json())
      .then(setResults)
      .catch(console.error);
  }, [meetId, gender]);

  if (!meet) {
    return <div className="meet-page" />;
  }

  const homeTeam = teams[0]
    ? {
        name: teams[0].name,
        score: Number(teams[0].team_score),
        logoUrl: teams[0].logo_url ?? undefined,
      }
    : { name: '—', score: 0 };
  const awayTeam = teams[1]
    ? {
        name: teams[1].name,
        score: Number(teams[1].team_score),
        logoUrl: teams[1].logo_url ?? undefined,
      }
    : { name: '—', score: 0 };

  return (
    <div className="meet-page">
      <MeetPageCard
        name={meet.name}
        status={statusLabel(meet.status)}
        date={formatDate(meet.meet_date)}
        location={meet.location}
        logoUrl={meet.logo_url ?? undefined}
      />

      <div className="meet-page-body">
        <div className="meet-gender-toggle">
          <button
            className={gender === 'men' ? 'active' : ''}
            onClick={(): void => setGender('men')}
          >
            Men
          </button>
          <button
            className={gender === 'women' ? 'active' : ''}
            onClick={(): void => setGender('women')}
          >
            Women
          </button>
        </div>

        <MeetTeamsScore homeTeam={homeTeam} awayTeam={awayTeam} />
        <MeetResultsTable
          results={results.map((r) => ({
            ...r,
            score: Number(r.score),
            points: r.points ?? 0,
          }))}
        />
      </div>
    </div>
  );
}
