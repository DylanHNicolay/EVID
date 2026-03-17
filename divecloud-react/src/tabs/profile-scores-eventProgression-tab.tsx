import React, { useState } from 'react';
import './profile-scores-eventProgression-tab.css';
import ScoreResultRow from '../components/profile/scores/ScoreResultRow';
import DiveChart from '../components/profile/scores/DiveChart';
import type { Result } from '../types';

interface eventProgressionProps {
  result: Result;
}

const ProfileScoresEventProgressionTab = ({
  result,
}: eventProgressionProps) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <React.Fragment>
      <ScoreResultRow
        result={result}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
      {expanded && (
        <tr>
          <td colSpan={5}>
            <DiveChart dives={result.dives} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default ProfileScoresEventProgressionTab;
