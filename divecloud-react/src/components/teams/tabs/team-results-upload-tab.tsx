import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './team-results-upload-tab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

type Height = '1m' | '3m' | 'platform';
type Category = 'men' | 'women' | 'mixed';
type PanelMode = 'upload' | 'schedule';

interface MeetOption {
  id: number;
  name: string;
  meet_date: string;
  status: string;
}

interface PreviewResponse {
  errors: string[];
  summary: {
    row_count: number;
    athlete_count: number;
    event_count: number;
  };
  preview_rows: Array<{
    athleteId: number;
    eventName: string;
    height: Height;
    category: Category;
    score: number;
    points: number | null;
    finalRank: number | null;
  }>;
  truncated_preview: boolean;
}

interface TeamResultsUploadTabProps {
  teamId: number;
}

interface TeamSearchOption {
  id: number;
  name: string;
  school?: string | null;
}

interface ScheduleForm {
  name: string;
  meetDate: string;
  dateEnd: string;
  location: string;
  course: 'SCY' | 'LCM' | 'SCM';
  meetType: 'championship' | 'invitational' | 'dual' | 'exhibition';
  season: string;
  gender: Category;
  logoUrl: string;
  attendingTeamIds: number[];
}

function formatDate(raw: string): string {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizePreviewEventName(value: string): string {
  const raw = String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!raw) return raw;

  return raw
    .replace(/^platfor\s+meter\b/i, 'Platform')
    .replace(/^platform\s+meter\b/i, 'Platform')
    .replace(/^platfor\b/i, 'Platform');
}

export default function TeamResultsUploadTab({
  teamId,
}: TeamResultsUploadTabProps): React.ReactElement {
  const { token } = useAuth();
  const [panelMode, setPanelMode] = useState<PanelMode>('upload');
  const [meetId, setMeetId] = useState('');
  const [csvText, setCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [meets, setMeets] = useState<MeetOption[]>([]);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [loadingTeamSearch, setLoadingTeamSearch] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamSearchResults, setTeamSearchResults] = useState<
    TeamSearchOption[]
  >([]);
  const [teamOptionsById, setTeamOptionsById] = useState<
    Record<number, TeamSearchOption>
  >({});
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    name: '',
    meetDate: new Date().toISOString().slice(0, 10),
    dateEnd: '',
    location: '',
    course: 'SCY',
    meetType: 'invitational',
    season: '',
    gender: 'mixed',
    logoUrl: '',
    attendingTeamIds: [],
  });

  useEffect(() => {
    fetch(`${API_URL}/api/teams/${teamId}/meets`)
      .then((r) => r.json())
      .then((rows: MeetOption[]) => setMeets(rows))
      .catch((err) => console.error('load meets failed', err));
  }, [teamId]);

  useEffect(() => {
    if (panelMode !== 'schedule') return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setLoadingTeamSearch(true);

      const query = teamSearch.trim();
      const params = new URLSearchParams();
      if (query) params.set('q', query);

      fetch(`${API_URL}/api/teams?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((rows: TeamSearchOption[]) => {
          const filteredRows = rows.filter((row) => Number(row.id) !== teamId);
          setTeamSearchResults(filteredRows);

          setTeamOptionsById((prev) => {
            const next = { ...prev };
            filteredRows.forEach((row) => {
              next[row.id] = row;
            });
            return next;
          });
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : '';
          if (!message.toLowerCase().includes('abort')) {
            console.error('team search failed', err);
          }
        })
        .finally(() => setLoadingTeamSearch(false));
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [panelMode, teamId, teamSearch]);

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (!meetId) return false;
    return csvText.trim().length > 0;
  }, [token, meetId, csvText]);

  const upcomingMeets = useMemo(
    () =>
      meets.filter(
        (meet) => String(meet.status || '').toLowerCase() === 'upcoming'
      ),
    [meets]
  );

  const requestBody = useMemo(() => {
    return {
      meetId: Number(meetId),
      csvText,
    };
  }, [meetId, csvText]);

  const canSchedule = useMemo(() => {
    if (!token) return false;
    return (
      scheduleForm.name.trim().length > 0 &&
      scheduleForm.meetDate.trim().length > 0
    );
  }, [token, scheduleForm]);

  const selectedAttendingTeams = useMemo(
    () =>
      scheduleForm.attendingTeamIds.map((id) => {
        const existing = teamOptionsById[id];
        if (existing) return existing;
        return {
          id,
          name: `Team #${id}`,
          school: null,
        };
      }),
    [scheduleForm.attendingTeamIds, teamOptionsById]
  );

  const toggleAttendingTeam = (selectedTeamId: number): void => {
    setScheduleForm((prev) => {
      const alreadySelected = prev.attendingTeamIds.includes(selectedTeamId);
      return {
        ...prev,
        attendingTeamIds: alreadySelected
          ? prev.attendingTeamIds.filter((id) => id !== selectedTeamId)
          : [...prev.attendingTeamIds, selectedTeamId],
      };
    });
  };

  const previewResults = async (): Promise<void> => {
    if (!token) {
      setError('You must be logged in.');
      return;
    }
    setLoadingPreview(true);
    setError('');
    setSuccess('');
    setPreview(null);
    try {
      const res = await fetch(
        `${API_URL}/api/teams/${teamId}/results/upload/preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Preview failed');
        return;
      }
      setPreview(data);
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        setError('Please resolve validation issues before confirming.');
      }
    } catch {
      setError('Preview request failed');
    } finally {
      setLoadingPreview(false);
    }
  };

  const confirmResults = async (): Promise<void> => {
    if (!token) {
      setError('You must be logged in.');
      return;
    }
    setLoadingConfirm(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(
        `${API_URL}/api/teams/${teamId}/results/upload/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.errors?.[0] || 'Confirm failed');
        setPreview((prev) => prev || null);
        return;
      }
      setSuccess(`Confirmed ${data.imported_rows} rows for meet ${meetId}.`);
      setPreview(null);
      setCsvText('');
      setCsvFileName('');
    } catch {
      setError('Confirm request failed');
    } finally {
      setLoadingConfirm(false);
    }
  };

  const downloadSampleCsv = async (): Promise<void> => {
    if (!token) {
      setError('You must be logged in.');
      return;
    }

    setLoadingSample(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (meetId) params.set('meetId', meetId);

      const res = await fetch(
        `${API_URL}/api/teams/${teamId}/results/upload/sample-csv?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to download sample CSV');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dispo = res.headers.get('content-disposition') || '';
      const match = dispo.match(/filename="?([^";]+)"?/i);
      const fileName = match?.[1] || 'meet-results-sample.csv';

      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download sample CSV');
    } finally {
      setLoadingSample(false);
    }
  };

  const scheduleMeet = async (): Promise<void> => {
    if (!token) {
      setError('You must be logged in.');
      return;
    }
    setLoadingSchedule(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/teams/${teamId}/meets/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Schedule failed');
        return;
      }

      if (data.meet && typeof data.meet.id === 'number') {
        setMeets((prev) => [data.meet, ...prev]);
        setMeetId(String(data.meet.id));
      }

      setSuccess(
        'Meet scheduled. You can now upload and confirm results for it.'
      );
      setPanelMode('upload');
    } catch {
      setError('Schedule request failed');
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <div className="team-upload-results">
      <div className="tur-header">
        <h3>Meet Management</h3>
        <p>
          Schedule a meet or upload and confirm results for an existing meet.
        </p>
      </div>

      <div className="tur-panel-toggle">
        <button
          type="button"
          className={panelMode === 'upload' ? 'active' : ''}
          onClick={(): void => setPanelMode('upload')}
        >
          Meet Management
        </button>
        <button
          type="button"
          className={panelMode === 'schedule' ? 'active' : ''}
          onClick={(): void => setPanelMode('schedule')}
        >
          Schedule Meet
        </button>
      </div>

      {panelMode === 'schedule' && (
        <div className="tur-schedule-card">
          <div className="tur-grid">
            <label>
              Meet Name
              <input
                value={scheduleForm.name}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Texas Diving Invite"
              />
            </label>

            <label>
              Meet Date
              <input
                type="date"
                value={scheduleForm.meetDate}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    meetDate: e.target.value,
                  }))
                }
              />
            </label>

            <label>
              End Date (optional)
              <input
                type="date"
                value={scheduleForm.dateEnd}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    dateEnd: e.target.value,
                  }))
                }
              />
            </label>

            <label>
              Location
              <input
                value={scheduleForm.location}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Austin, TX"
              />
            </label>

            <label>
              Course
              <select
                value={scheduleForm.course}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    course: e.target.value as ScheduleForm['course'],
                  }))
                }
              >
                <option value="SCY">SCY</option>
                <option value="LCM">LCM</option>
                <option value="SCM">SCM</option>
              </select>
            </label>

            <label>
              Meet Type
              <select
                value={scheduleForm.meetType}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    meetType: e.target.value as ScheduleForm['meetType'],
                  }))
                }
              >
                <option value="invitational">Invitational</option>
                <option value="dual">Dual</option>
                <option value="championship">Championship</option>
                <option value="exhibition">Exhibition</option>
              </select>
            </label>

            <label>
              Season (optional)
              <input
                value={scheduleForm.season}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    season: e.target.value,
                  }))
                }
                placeholder="2026-2027"
              />
            </label>

            <label>
              Team Gender Bucket
              <select
                value={scheduleForm.gender}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    gender: e.target.value as Category,
                  }))
                }
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>

            <label>
              Logo URL (optional)
              <input
                value={scheduleForm.logoUrl}
                onChange={(e): void =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    logoUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </label>

            <div className="tur-grid-full">
              <label htmlFor="tur-attending-teams-search">
                Other Schools Attending (optional)
              </label>
              <input
                id="tur-attending-teams-search"
                value={teamSearch}
                onChange={(e): void => setTeamSearch(e.target.value)}
                placeholder="Search by school or team name"
              />
              <p className="tur-help tur-inline-help">
                Select the schools that may attend this meet.
              </p>

              {selectedAttendingTeams.length > 0 && (
                <div className="tur-selected-teams">
                  {selectedAttendingTeams.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      className="tur-team-chip"
                      onClick={(): void => toggleAttendingTeam(team.id)}
                    >
                      {team.name}
                      {team.school ? ` (${team.school})` : ''} ×
                    </button>
                  ))}
                </div>
              )}

              <div
                className="tur-team-options"
                role="listbox"
                aria-multiselectable
              >
                {loadingTeamSearch ? (
                  <p className="tur-help">Loading schools...</p>
                ) : (
                  teamSearchResults.map((team) => {
                    const checked = scheduleForm.attendingTeamIds.includes(
                      team.id
                    );
                    return (
                      <label key={team.id} className="tur-team-option">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(): void => toggleAttendingTeam(team.id)}
                        />
                        <span>
                          {team.name}
                          {team.school ? ` (${team.school})` : ''}
                        </span>
                      </label>
                    );
                  })
                )}
                {!loadingTeamSearch && teamSearchResults.length === 0 && (
                  <p className="tur-help">No schools found.</p>
                )}
              </div>
            </div>
          </div>

          <div className="tur-actions">
            <button
              type="button"
              disabled={!canSchedule || loadingSchedule}
              onClick={scheduleMeet}
            >
              {loadingSchedule ? 'Scheduling...' : 'Schedule Meet'}
            </button>
          </div>
        </div>
      )}

      {panelMode === 'upload' && (
        <>
          <div className="tur-controls">
            <label>
              Meet
              <select
                value={meetId}
                onChange={(e): void => setMeetId(e.target.value)}
              >
                <option value="">Select an upcoming meet</option>
                {upcomingMeets.map((meet) => (
                  <option key={meet.id} value={meet.id}>
                    {meet.name} ({formatDate(meet.meet_date)})
                  </option>
                ))}
              </select>
              {upcomingMeets.length === 0 && (
                <p className="tur-help">
                  No upcoming meets available. Schedule a meet first.
                </p>
              )}
            </label>
          </div>

          <div className="tur-csv">
            <p className="tur-help">
              Required columns: athlete_id, event_name, height, category, score.
              Optional: points, final_rank (auto-calculated when omitted).
            </p>
            <ul className="tur-help-list">
              <li>Accepted height values: 1m, 3m, platform</li>
              <li>Accepted category values: men, women, mixed</li>
              <li>Points and rank can be blank and will be auto-derived</li>
            </ul>
            <button
              type="button"
              className="tur-template-link"
              onClick={downloadSampleCsv}
              disabled={loadingSample}
            >
              {loadingSample ? 'Generating Sample...' : 'Download Sample CSV'}
            </button>
            <input
              className="tur-file-input"
              type="file"
              accept=".csv,text/csv"
              onChange={async (e): Promise<void> => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                setCsvText(text);
                setCsvFileName(file.name);
              }}
            />
            {csvFileName && (
              <p className="tur-file-name">Loaded file: {csvFileName}</p>
            )}
            <textarea
              value={csvText}
              onChange={(e): void => setCsvText(e.target.value)}
              placeholder="Paste CSV here"
              rows={10}
            />
          </div>

          <div className="tur-actions">
            <button
              type="button"
              disabled={!canSubmit || loadingPreview}
              onClick={previewResults}
            >
              {loadingPreview ? 'Previewing...' : 'Preview'}
            </button>
            <button
              type="button"
              disabled={
                !canSubmit ||
                loadingConfirm ||
                !preview ||
                (Array.isArray(preview.errors) && preview.errors.length > 0)
              }
              onClick={confirmResults}
            >
              {loadingConfirm ? 'Confirming...' : 'Confirm Results'}
            </button>
          </div>
        </>
      )}

      {error && <p className="tur-error">{error}</p>}
      {success && <p className="tur-success">{success}</p>}

      {panelMode === 'upload' && preview && (
        <div className="tur-preview">
          <h4>Preview</h4>
          <p>
            Rows: {preview.summary.row_count} | Athletes:{' '}
            {preview.summary.athlete_count} | Events:{' '}
            {preview.summary.event_count}
          </p>
          {preview.errors.length > 0 && (
            <ul>
              {preview.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {preview.preview_rows.length > 0 && (
            <div className="tur-preview-table-wrap">
              <table className="tur-preview-table">
                <thead>
                  <tr>
                    <th>Athlete ID</th>
                    <th>Event</th>
                    <th>Height</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Points</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview_rows.map((row, idx) => (
                    <tr key={`${row.athleteId}-${row.eventName}-${idx}`}>
                      <td>{row.athleteId}</td>
                      <td>{normalizePreviewEventName(row.eventName)}</td>
                      <td>{row.height}</td>
                      <td>{row.category}</td>
                      <td>{row.score}</td>
                      <td>{row.points ?? '-'}</td>
                      <td>{row.finalRank ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {preview.truncated_preview && (
            <p>Preview truncated to first 50 rows.</p>
          )}
        </div>
      )}
    </div>
  );
}
