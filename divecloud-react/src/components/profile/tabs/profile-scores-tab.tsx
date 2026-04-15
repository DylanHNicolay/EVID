import React from 'react';
import ScoresSection from '../scores/ScoresSection';

interface ProfileScoresTabProps {
  athleteId: number;
  initialTab?: string;
  focusEntryId?: number;
}

export default function ProfileScoresTab({
  athleteId,
  initialTab,
  focusEntryId,
}: ProfileScoresTabProps): React.ReactElement {
  return (
    <ScoresSection
      athleteId={athleteId}
      initialTab={initialTab}
      focusEntryId={focusEntryId}
    />
  );
}
