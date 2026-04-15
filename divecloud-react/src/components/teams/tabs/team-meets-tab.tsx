import React, { useState } from 'react';
import './team-meets-tab.css';
import MeetList from '../meets/MeetList';

interface TeamMeetsTabProps {
  teamId: number;
}

export default function TeamMeetsTab({
  teamId,
}: TeamMeetsTabProps): React.ReactElement {
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [seasonFilter, setSeasonFilter] = useState('');

  return (
    <div className="meets-layout">
      <div className="meets-main">
        <MeetList
          teamId={teamId}
          nameFilter={nameFilter}
          typeFilter={typeFilter}
          seasonFilter={seasonFilter}
        />
      </div>

      <aside className="meets-sidebar">
        <div className="meets-filter-group">
          <label className="meets-filter-label">Meet Name</label>
          <input
            className="meets-filter-input"
            type="text"
            value={nameFilter}
            onChange={(e): void => setNameFilter(e.target.value)}
          />
        </div>
        <div className="meets-filter-group">
          <label className="meets-filter-label">Meet Type</label>
          <select
            className="meets-filter-input"
            value={typeFilter}
            onChange={(e): void => setTypeFilter(e.target.value)}
          >
            <option>All</option>
            <option>championship</option>
            <option>invitational</option>
            <option>dual</option>
          </select>
        </div>
        <div className="meets-filter-group">
          <label className="meets-filter-label">Season</label>
          <input
            className="meets-filter-input"
            type="text"
            placeholder="e.g. 2025-2026"
            value={seasonFilter}
            onChange={(e): void => setSeasonFilter(e.target.value)}
          />
        </div>
      </aside>
    </div>
  );
}
