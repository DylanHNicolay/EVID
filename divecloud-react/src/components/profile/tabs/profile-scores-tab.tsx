import React from 'react';
import ScoresSection from '../scores/ScoresSection';

interface ProfileScoresTabProps {
  athleteId: number;
}

export default function ProfileScoresTab({
  athleteId,
}: ProfileScoresTabProps): React.ReactElement {
  return <ScoresSection athleteId={athleteId} />;
}
