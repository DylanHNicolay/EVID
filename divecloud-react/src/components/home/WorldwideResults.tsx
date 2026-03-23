import React from 'react';
import './WorldwideResults.css';

interface MeetResult {
  id: number;
  name: string;
  date: string;
  location: string;
  logoUrl: string;
}

const mockResults: MeetResult[] = [
  {
    id: 1,
    name: "NCAA Division I Women's Championship",
    date: 'Mar 18\u201321, 2026',
    location: 'Atlanta, GA',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 2,
    name: 'SA National Youth Championships',
    date: 'Mar 18\u201320, 2026',
    location: 'Port Elizabeth, EC, RSA',
    logoUrl: 'https://flagcdn.com/w40/za.png',
  },
  {
    id: 3,
    name: 'USRY Time Trials',
    date: 'Mar 19\u201322, 2026',
    location: 'Lynchburg, VA',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 4,
    name: 'NCSA Spring Championships',
    date: 'Mar 17\u201321, 2026',
    location: 'Orlando, FL',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 5,
    name: 'SwimStrong Dryland National...',
    date: 'Mar 19\u201322, 2026',
    location: 'Fishers, IN',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 6,
    name: 'MAGS Championship (25y)',
    date: 'Mar 20\u201322, 2026',
    location: 'Holland, MI',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 7,
    name: 'OTP Banka \u010Cetveroboj',
    date: 'Mar 21\u201322, 2026',
    location: 'Maribor, SLO',
    logoUrl: 'https://flagcdn.com/w40/si.png',
  },
  {
    id: 8,
    name: 'Singapore National Age Group...',
    date: 'Mar 17\u201322, 2026',
    location: 'Singapore, SG, SIN',
    logoUrl: 'https://flagcdn.com/w40/sg.png',
  },
  {
    id: 9,
    name: 'Bob Miyashiro Invite',
    date: 'Mar 19\u201321, 2026',
    location: 'Santa Rosa, CA',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
];

export default function WorldwideResults(): React.ReactElement {
  return (
    <div className="worldwide-card">
      <h2 className="worldwide-title">Worldwide Results</h2>

      <div className="worldwide-grid">
        {mockResults.map((meet) => (
          <div key={meet.id} className="worldwide-meet-item">
            <img className="worldwide-meet-logo" src={meet.logoUrl} alt="" />
            <div className="worldwide-meet-info">
              <span className="worldwide-meet-name">{meet.name}</span>
              <span className="worldwide-meet-meta">
                {meet.date} &middot; {meet.location}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
