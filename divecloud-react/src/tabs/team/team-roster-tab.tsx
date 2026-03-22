import React, { useState } from 'react';
import './TeamRosterTab.css';
import RosterTable from '../../components/teams/roster/RosterTable';
import CoachCard from '../../components/teams/roster/CoachCard';

export default function TeamRosterTab(): React.ReactElement {
  const [gender, setGender] = useState<'Men' | 'Women'>('Men');

  return (
    <div className="roster-layout">
      {/* Left */}
      <div className="roster-main">
        <RosterTable gender={gender} />
      </div>

      {/* Right sidebar */}
      <div className="roster-sidebar">
        {/* Gender toggle */}
        <div className="gender-toggle">
          <button
            className={gender === 'Men' ? 'active' : ''}
            onClick={() => setGender('Men')}
          >
            Men
          </button>
          <button
            className={gender === 'Women' ? 'active' : ''}
            onClick={() => setGender('Women')}
          >
            Women
          </button>
        </div>

        {/* Filters */}
        <div className="roster-filters">
          <label>Event</label>
          <select>
            <option>All</option>
            <option>1 Meter</option>
            <option>3 Meter</option>
            <option>Platform</option>
          </select>

          <label>Order By</label>
          <select>
            <option>Name</option>
            <option>Points</option>
            <option>Class</option>
          </select>
        </div>

        {/* Coach */}
        <CoachCard name="Carina Lowell" title="Head Coach" />
      </div>
    </div>
  );
}
