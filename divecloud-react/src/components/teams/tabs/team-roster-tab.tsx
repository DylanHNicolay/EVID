import React, { useState } from 'react';
import './TeamRosterTab.css';
import RosterTable from '../roster/RosterTable';
import CoachCard from '../roster/CoachCard';

export default function TeamRosterTab(): React.ReactElement {
  const [gender, setGender] = useState<'Men' | 'Women'>('Men');
  const [event, setEvent] = useState('All');
  const [orderBy, setOrderBy] = useState('Name');

  return (
    <div className="roster-layout">
      <div className="roster-main">
        <RosterTable gender={gender} event={event} orderBy={orderBy} />
      </div>

      <div className="roster-sidebar">
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

        <div className="roster-filters">
          <label>Event</label>
          <select value={event} onChange={(e) => setEvent(e.target.value)}>
            <option>All</option>
            <option>1 Meter</option>
            <option>3 Meter</option>
            <option>Platform</option>
          </select>

          <label>Order By</label>
          <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option>Name</option>
            <option>Points</option>
            <option>Class</option>
          </select>
        </div>

        <CoachCard name="Carina Lowell" title="Head Coach" />
      </div>
    </div>
  );
}
