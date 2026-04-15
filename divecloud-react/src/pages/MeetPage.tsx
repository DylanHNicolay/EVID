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
  team_score: number | null;
}

interface ResultRow {
  id: number;
  athlete_id: number;
  name: string;
  team: string;
  event: string;
  score: number;
  points: number;
}

type MeetCategory = 'men' | 'women' | 'mixed';

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
  const [gender, setGender] = useState<MeetCategory>('men');

  const [meet, setMeet] = useState<MeetInfo | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);

  useEffect(() => {
    if (!meetId) return;
    const controller = new AbortController();
    fetch(`${API_URL}/api/meets/${meetId}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Meet not found');
        return r.json();
      })
      .then(setMeet)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return (): void => {
      controller.abort();
    };
  }, [meetId]);

  useEffect(() => {
    if (!meetId) return;
    const controller = new AbortController();
    fetch(`${API_URL}/api/meets/${meetId}/teams?gender=${gender}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(setTeams)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    fetch(`${API_URL}/api/meets/${meetId}/results?gender=${gender}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(setResults)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return (): void => {
      controller.abort();
    };
  }, [meetId, gender]);

  if (!meet) {
    return <div className="meet-page" />;
  }

  const teamScores = teams.map((team) => ({
    teamId: team.team_id,
    name: team.name,
    score: Number(team.team_score ?? 0),
    logoUrl: team.logo_url ?? undefined,
  }));

  return (
    <div className="meet-page">
      <MeetPageCard
        meetId={meet.id}
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
          <button
            className={gender === 'mixed' ? 'active' : ''}
            onClick={(): void => setGender('mixed')}
          >
            Mixed
          </button>
        </div>

        <MeetTeamsScore teams={teamScores} />
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
