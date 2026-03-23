import React from 'react';
import './MeetList.css';

interface Meet {
  id: number;
  name: string;
  status: 'Upcoming' | 'Completed';
  dateRange: string;
  location: string;
  logoUrl?: string;
  type: string;
  season: string;
}

const mockMeets: Meet[] = [
  {
    id: 1,
    name: "NCAA Division I Men's Championships",
    status: 'Upcoming',
    dateRange: 'Mar 25-28, 2026',
    location: 'Atlanta, GA',
    type: 'Championship',
    season: '2025-2026',
  },
  {
    id: 2,
    name: "NCAA Division I Women's Championship",
    status: 'Completed',
    dateRange: 'Mar 18-21, 2026',
    location: 'Atlanta, GA',
    type: 'Championship',
    season: '2025-2026',
  },
  {
    id: 3,
    name: 'Cavalier Last Chance Meet',
    status: 'Completed',
    dateRange: 'Feb 28-Mar 1, 2026',
    location: 'Charlottesville, VA',
    type: 'Invitational',
    season: '2025-2026',
  },
  {
    id: 4,
    name: 'Atlantic Coast Championships',
    status: 'Completed',
    dateRange: 'Feb 17-21, 2026',
    location: 'Atlanta, GA',
    type: 'Championship',
    season: '2025-2026',
  },
  {
    id: 5,
    name: 'Cavalier Invite',
    status: 'Completed',
    dateRange: 'Feb 5-7, 2026',
    location: 'Charlottesville, VA',
    type: 'Invitational',
    season: '2025-2026',
  },
  {
    id: 6,
    name: 'NC State vs. Virginia',
    status: 'Completed',
    dateRange: 'Jan 23, 2026',
    location: 'Raleigh, NC',
    type: 'Dual',
    season: '2025-2026',
  },
];

interface MeetListProps {
  nameFilter: string;
  typeFilter: string;
  seasonFilter: string;
}

const MeetList = ({
  nameFilter,
  typeFilter,
  seasonFilter,
}: MeetListProps): React.ReactElement => {
  const filtered = mockMeets.filter((meet) => {
    const matchesName = meet.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || meet.type === typeFilter;
    const matchesSeason = meet.season === seasonFilter;
    return matchesName && matchesType && matchesSeason;
  });

  return (
    <div className="meet-list">
      {filtered.map((meet) => (
        <div key={meet.id} className="meet-item">
          <div className="meet-logo-placeholder" />
          <div className="meet-info">
            <span className="meet-name">{meet.name}</span>
            <span className="meet-meta">
              <span
                className={`meet-status ${meet.status === 'Upcoming' ? 'upcoming' : 'completed'}`}
              >
                {meet.status}
              </span>{' '}
              • {meet.dateRange} • {meet.location}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetList;
