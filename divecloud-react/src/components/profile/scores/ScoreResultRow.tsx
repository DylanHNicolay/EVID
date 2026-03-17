import React from 'react';
import './ScoreResultRow.css';
import type { Result } from '../../../types';

interface ScoreResultRowProps {
  onToggle: () => void;
  result: Result;
  expanded: boolean;
}

const ScoreResultRow = ({
  result,
  expanded,
  onToggle,
}: ScoreResultRowProps) => {
  return (
    <tr className="result-row">
      <td onClick={onToggle}>{expanded ? '▼' : '▶'}</td>
      <td className="event">{result.event}</td>
      <td className="score">{result.score}</td>
      <td className="meet">{result.meet}</td>
      <td className="date">{result.date}</td>
    </tr>
  );
};

export default ScoreResultRow;
