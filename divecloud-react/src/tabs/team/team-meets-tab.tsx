import React, { useState } from 'react';
import './team-meets-tab.css';
import MeetList from '../../components/teams/meets/MeetList';

export default function TeamMeetsTab(): React.ReactElement {
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [seasonFilter, setSeasonFilter] = useState('2025-2026');

  return (
    <div className="meets-layout">
      <div className="meets-main">
        <MeetList
          nameFilter={nameFilter}
          typeFilter={typeFilter}
          seasonFilter={seasonFilter}
        />
      </div>

      <div className="meets-sidebar">
        <div className="meets-filters">
          <label>Name</label>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder=""
          />

          <label>Meet Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All</option>
            <option>Championship</option>
            <option>Invitational</option>
            <option>Dual</option>
          </select>

          <label>Season</label>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
          >
            <option>2025-2026</option>
            <option>2024-2025</option>
            <option>2023-2024</option>
          </select>
        </div>
      </div>
    </div>
  );
}
