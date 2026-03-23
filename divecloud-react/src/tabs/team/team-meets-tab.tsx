import React, { useState } from 'react';
import './team-meets-tab.css';
import MeetList from '../../components/teams/meets/MeetList';

export default function TeamMeetsTab(): React.ReactElement {
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [seasonFilter, setSeasonFilter] = useState('2025-2026');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      console.log('Selected:', e.target.files[0].name);
    }
  };

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
        <button
          className="submit-meet-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Submit meet
        </button>

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {selectedFile && (
          <p className="selected-file">📄 {selectedFile.name}</p>
        )}

        <div className="meets-filters">
          <label>Name</label>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
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
