import React, { useState } from 'react';
import ScoreResultRow from '../scores/ScoreResultRow';
import DiveChart from '../scores/DiveChart';
import type { Result } from '../../../types';

interface eventProgressionProps {
  result: Result;
}

const ProfileScoresEventProgressionTab = ({
  result,
}: eventProgressionProps): React.ReactElement => {
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
