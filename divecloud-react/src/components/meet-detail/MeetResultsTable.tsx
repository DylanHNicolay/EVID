import React from 'react';
import { Link } from 'react-router-dom';
import './MeetResultsTable.css';

interface MeetResult {
  id: number;
  athlete_id: number;
  name: string;
  team: string;
  event: string;
  score: number;
  points: number;
}

interface MeetResultsTableProps {
  results: MeetResult[];
}

const MeetResultsTable = ({
  results,
}: MeetResultsTableProps): React.ReactElement => {
  return (
    <div className="meet-results-card">
      <h3 className="meet-results-title">Results</h3>
      <table className="meet-results-table">
        <thead>
          <tr>
            <th className="col-name">Name</th>
            <th className="col-team">Team</th>
            <th className="col-event">Event</th>
            <th className="col-score">Score</th>
            <th className="col-pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={5} className="meet-results-empty">
                No results available
              </td>
            </tr>
          ) : (
            results.map((result) => (
              <tr key={result.id} className="meet-results-row">
                <td className="col-name">
                  <Link
                    to={`/profile/${result.athlete_id}?tab=Scores&scoresTab=Event%20History&entryId=${result.id}`}
                  >
                    {result.name}
                  </Link>
                </td>
                <td className="col-team">{result.team}</td>
                <td className="col-event">{result.event}</td>
                <td className="col-score">{result.score.toFixed(2)}</td>
                <td className="col-pts">{result.points}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MeetResultsTable;
