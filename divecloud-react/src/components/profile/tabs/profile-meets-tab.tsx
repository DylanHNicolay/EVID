import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetCard from '../MeetCard';
import './profile-meets-tab.css';

interface Meet {
  id: string;
  name: string;
  event?: string;
  dives?: number;
  score?: number;
  place?: string;
  avatarUrl?: string;
  year?: number;
}

export default function ProfileMeetsTab(): React.ReactElement {
  const navigate = useNavigate();
  const [yearFilter, setYearFilter] = useState('All');
  const [nameFilter, setNameFilter] = useState('');
  const [sortBy, setSortBy] = useState('None');

  // Mock data - will be replaced with actual data from backend
  const [meets] = useState<Meet[]>([
    {
      id: '1',
      name: 'Stanford Vs California',
      event: '3M',
      dives: 6,
      score: 256,
      place: '6th',
      year: 2024,
    },
    {
      id: '2',
      name: 'Stanford Vs California',
      event: '10M',
      dives: 6,
      score: 312,
      place: '3rd',
      year: 2024,
    },
    {
      id: '3',
      name: 'Stanford Vs California',
      event: '1M',
      dives: 6,
      score: 198,
      place: '1st',
      year: 2024,
    },
  ]);

  const handleMeetClick = (meetId: string): void => {
    navigate(`/meet/${meetId}`);
  };

  const filteredMeets = meets
    .filter((meet) => {
      if (yearFilter !== 'All' && meet.year !== parseInt(yearFilter)) {
        return false;
      }
      if (
        nameFilter &&
        !meet.name.toLowerCase().includes(nameFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="meets-tab-container">
      <div className="meets-filters">
        <div className="filter-group">
          <label htmlFor="year-filter">Year</label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="filter-select"
          >
            <option>All</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="name-filter">Name</label>
          <input
            id="name-filter"
            type="text"
            placeholder="Search Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option>None</option>
            <option>Name</option>
            <option>Date</option>
          </select>
        </div>
      </div>

      <div className="meets-grid">
        {filteredMeets.map((meet) => (
          <MeetCard
            key={meet.id}
            id={meet.id}
            name={meet.name}
            event={meet.event}
            dives={meet.dives}
            score={meet.score}
            place={meet.place}
            avatarUrl={meet.avatarUrl}
            onClick={handleMeetClick}
          />
        ))}
      </div>

      {filteredMeets.length === 0 && (
        <div className="no-meets-message">No meets found</div>
      )}
    </div>
  );
}
