import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RosterTable.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface Athlete {
  id: number;
  name: string;
  hometown: string | null;
  graduation_year: number | null;
  points: number;
}

interface RosterTableProps {
  teamId: number;
  gender: 'men' | 'women';
  orderBy: string;
}

function yearLabel(grad: number | null): string {
  if (!grad) return '—';
  const now = new Date().getFullYear();
  const diff = grad - now;
  if (diff <= 0) return 'SR';
  if (diff === 1) return 'JR';
  if (diff === 2) return 'SO';
  return 'FR';
}

const RosterTable = ({
  teamId,
  gender,
  orderBy,
}: RosterTableProps): React.ReactElement => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/teams/${teamId}/roster?gender=${gender}`)
      .then((r) => r.json())
      .then(setAthletes)
      .catch(console.error);
  }, [teamId, gender]);

  let sorted = [...athletes];
  if (orderBy === 'Points') {
    sorted.sort((a, b) => Number(b.points) - Number(a.points));
  }

  return (
    <div className="roster-table-card">
      <div className="roster-header">
        <h3>{gender === 'men' ? 'Men' : 'Women'}</h3>
      </div>

      <table className="roster-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Hometown</th>
            <th>Class</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((athlete, i) => (
            <tr
              key={athlete.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${athlete.id}`)}
            >
              <td>{i + 1}</td>
              <td className="athlete-name">{athlete.name}</td>
              <td>{athlete.hometown || '—'}</td>
              <td>{yearLabel(athlete.graduation_year)}</td>
              <td className="athlete-points">
                {Number(athlete.points).toFixed(1)}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{ textAlign: 'center', padding: 20, color: '#888' }}
              >
                No athletes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RosterTable;
