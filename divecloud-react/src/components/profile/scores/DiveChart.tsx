import React from 'react';
import './DiveChart.css';
import type { DiveScore } from '../../../types';

interface DiveChartProps {
  dives: DiveScore[];
}

const DiveChart = ({ dives }: DiveChartProps): React.ReactElement => {
  return (
    <div>
      <table className="dive-chart">
        <thead>
          <tr>
            <th>Dive</th>
            <th>Award</th>
            <th>DD</th>
            <th>J1</th>
            <th>J2</th>
            <th>J3</th>
            <th>J4</th>
            <th>J5</th>
          </tr>
        </thead>
        <tbody>
          {dives.map((dive) => (
            <tr key={dive.dive}>
              <td>{dive.dive}</td>
              <td>{dive.award}</td>
              <td>{dive.dd}</td>
              <td>{dive.j1}</td>
              <td>{dive.j2}</td>
              <td>{dive.j3}</td>
              <td>{dive.j4}</td>
              <td>{dive.j5}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiveChart;
