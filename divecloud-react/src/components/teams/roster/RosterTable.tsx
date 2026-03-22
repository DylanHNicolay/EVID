import React from 'react';
import './RosterTable.css';

interface Athlete {
  id: number;
  name: string;
  hometown: string;
  year: string;
  points: number;
}

const mockAthletes: Athlete[] = [
  {
    id: 1,
    name: 'Francesco Brillante',
    hometown: 'Staten Island, NY',
    year: 'FR',
    points: 603.05,
  },
  {
    id: 2,
    name: 'Jake Chee-A-Tow',
    hometown: 'Bridgetown, BAR',
    year: 'JR',
    points: 640.8,
  },
  {
    id: 3,
    name: 'Nils Forster',
    hometown: 'Coos Bay, OR',
    year: 'SO',
    points: 567.9,
  },
  {
    id: 4,
    name: 'Peter Gentilini',
    hometown: 'Bethpage, NY',
    year: 'SO',
    points: 542.6,
  },
  {
    id: 5,
    name: 'Ryan Kakimseit',
    hometown: 'New York, NY',
    year: 'JR',
    points: 695.3,
  },
];
interface RosterTableProps {
  gender: 'Men' | 'Women';
}

const RosterTable = ({ gender }: RosterTableProps): React.ReactElement => {
  return (
    <div className="roster-table-card">
      {/* Header */}
      <div className="roster-header">
        <h3>Season 2025-2026 {gender}</h3>
      </div>

      {/* Table */}
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
          {mockAthletes.map((athlete, i) => (
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
