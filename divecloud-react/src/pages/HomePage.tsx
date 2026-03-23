import React from 'react';
import TopEvents from '../components/home/TopEvents';
import CollegeCommitments from '../components/home/CollegeCommitments';
import FeatureCards from '../components/home/FeatureCards';

export default function HomePage(): React.ReactElement {
  return (
    <div>
      <TopEvents />
      <CollegeCommitments />
      <FeatureCards />
    </div>
  );
}
