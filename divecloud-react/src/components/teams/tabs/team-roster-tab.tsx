import React, { useState, useEffect } from 'react';
import './TeamRosterTab.css';
import RosterTable from '../roster/RosterTable';
import CoachCard from '../roster/CoachCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface Coach {
  id: number;
  name: string;
  title: string;
  photo_url: string | null;
}

interface TeamRosterTabProps {
  teamId: number;
}

export default function TeamRosterTab({
  teamId,
}: TeamRosterTabProps): React.ReactElement {
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [orderBy, setOrderBy] = useState('Name');
  const [coaches, setCoaches] = useState<Coach[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/teams/${teamId}/coaches`)
      .then((r) => r.json())
      .then(setCoaches)
      .catch(console.error);
  }, [teamId]);

  return (
    <div className="roster-layout">
      <div className="roster-main">
        <RosterTable teamId={teamId} gender={gender} orderBy={orderBy} />
      </div>

      <div className="roster-sidebar">
        <div className="gender-toggle">
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

        <div className="roster-filters">
          <label>Order By</label>
          <select
            value={orderBy}
            onChange={(e): void => setOrderBy(e.target.value)}
          >
            <option>Name</option>
            <option>Points</option>
          </select>
        </div>

        {coaches.map((c) => (
          <CoachCard
            key={c.id}
            name={c.name}
            title={c.title}
            photoUrl={c.photo_url || undefined}
          />
        ))}
      </div>
    </div>
  );
}
