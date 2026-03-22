import React from 'react';
import './RosterTable.css';

interface Athlete {
  id: number;
  name: string;
  hometown: string;
  year: string;
  points: number;
  gender: 'Men' | 'Women';
  event: string;
}

const mockAthletes: Athlete[] = [
  {
    id: 1,
    name: 'Francesco Brillante',
    hometown: 'Staten Island, NY',
    year: 'FR',
    points: 603.05,
    gender: 'Men',
    event: '1 Meter',
  },
  {
    id: 2,
    name: 'Jake Chee-A-Tow',
    hometown: 'Bridgetown, BAR',
    year: 'JR',
    points: 640.8,
    gender: 'Men',
    event: '3 Meter',
  },
  {
    id: 3,
    name: 'Nils Forster',
    hometown: 'Coos Bay, OR',
    year: 'JR',
    points: 567.9,
    gender: 'Men',
    event: 'Platform',
  },
  {
    id: 4,
    name: 'Peter Gentilini',
    hometown: 'Bethpage, NY',
    year: 'SO',
    points: 542.6,
    gender: 'Men',
    event: '1 Meter',
  },
  {
    id: 5,
    name: 'Ryan Kakimseit',
    hometown: 'New York, NY',
    year: 'JR',
    points: 695.3,
    gender: 'Men',
    event: '3 Meter',
  },
  {
    id: 6,
    name: 'Sarah Johnson',
    hometown: 'Boston, MA',
    year: 'SR',
    points: 720.1,
    gender: 'Women',
    event: '1 Meter',
  },
  {
    id: 7,
    name: 'Emily Chen',
    hometown: 'Austin, TX',
    year: 'JR',
    points: 680.45,
    gender: 'Women',
    event: '3 Meter',
  },
  {
    id: 8,
    name: 'Mia Rodriguez',
    hometown: 'Miami, FL',
    year: 'FR',
    points: 598.3,
    gender: 'Women',
    event: 'Platform',
  },
  {
    id: 9,
    name: 'Olivia Park',
    hometown: 'Seattle, WA',
    year: 'SO',
    points: 612.75,
    gender: 'Women',
    event: '1 Meter',
  },
  {
    id: 10,
    name: 'Anna Smith',
    hometown: 'Chicago, IL',
    year: 'JR',
    points: 655.9,
    gender: 'Women',
    event: '3 Meter',
  },
];

interface RosterTableProps {
  gender: 'Men' | 'Women';
  event: string;
  orderBy: string;
}

const RosterTable = ({
  gender,
  event,
  orderBy,
}: RosterTableProps): React.ReactElement => {
  let filtered = mockAthletes.filter((a) => a.gender === gender);

  if (event !== 'All') {
    filtered = filtered.filter((a) => a.event === event);
  }

  if (orderBy === 'Name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (orderBy === 'Points') {
    filtered = [...filtered].sort((a, b) => b.points - a.points);
  } else if (orderBy === 'Class') {
    filtered = [...filtered].sort((a, b) => a.year.localeCompare(b.year));
  }

  return (
    <div className="roster-table-card">
      <div className="roster-header">
        <h3>Season 2025-2026 {gender}</h3>
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
          {filtered.map((athlete, i) => (
            <tr key={athlete.id}>
              <td>{i + 1}</td>
              <td className="athlete-name">{athlete.name}</td>
              <td>{athlete.hometown}</td>
              <td>{athlete.year}</td>
              <td className="athlete-points">{athlete.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RosterTable;
