import React, { useState, useEffect, useRef } from 'react';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  Camera, Play, Square, CheckCircle2, XCircle, UserCheck, UserX,
  AlertTriangle, ShieldAlert, RefreshCw, Scan, Clock, Users, MapPin,
} from 'lucide-react';
import { INITIAL_TIMETABLE, INITIAL_STUDENTS } from '../../services/mockData';
import { TimetableEntry, Student } from '../../types';

type CameraState = 'IDLE' | 'INITIALIZING' | 'READY' | 'TIMEOUT' | 'ERROR';
type SessionState = 'SELECTING' | 'ACTIVE' | 'ENDED';
type RecognitionStatus = 'SCANNING' | 'MATCHED' | 'UNKNOWN';

interface MarkedRecord {
  student_id: string;
  name: string;
  time: string;
  confidence: number;
  status: 'PRESENT' | 'ABSENT';
}

const DAYS_ORDER = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const todayName = DAYS_ORDER[new Date().getDay()];

export const TeacherAttendanceStart: React.FC = () => {
  const { user } = useAuth();
  const teacherId = user?.teacher_id || 'T101';

  const myTodayEntries = INITIAL_TIMETABLE.filter(
    (t) => t.teacher_id === teacherId && t.day_of_week === todayName
  ).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const [sessionState, setSessionState] = useState<SessionState>('SELECTING');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('IDLE');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [markedRecords, setMarkedRecords] = useState<MarkedRecord[]>([]);
  const [recognition, setRecognition] = useState<{ status: RecognitionStatus; name?: string; studentId?: string; confidence?: number }>({ status: 'SCANNING' });
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionIntervalRef = useRef<number | null>(null);

  const registeredStudents: Student[] = selectedEntry
    ? INITIAL_STUDENTS.filter((s) => s.class_id === selectedEntry.class_id && s.face_registered && s.is_active)
    : [];

  const presentCount = markedRecords.filter((r) => r.status === 'PRESENT').length;
  const totalStudents = selectedEntry
    ? INITIAL_STUDENTS.filter((s) => s.class_id === selectedEntry.class_id && s.is_active).length
    : 0;
  const absentCount = totalStudents - presentCount;

  const startCamera = async () => {
    setCameraState('INITIALIZING');
    setRecognition({ status: 'SCANNING' });

    const timeoutId = window.setTimeout(() => {
      setCameraState((prev) => (prev === 'INITIALIZING' ? 'TIMEOUT' : prev));
    }, 5000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        });
        clearTimeout(timeoutId);
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraState('READY');
        setIsRecognizing(true);
      } else {
        // Simulation mode (no hardware camera)
        clearTimeout(timeoutId);
        setTimeout(() => {
          setCameraState('READY');
          setIsRecognizing(true);
        }, 1200);
      }
    } catch {
      clearTimeout(timeoutId);
      setCameraState('ERROR');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    setIsRecognizing(false);
  };

  // Simulated face recognition loop
  useEffect(() => {
    if (cameraState !== 'READY' || !isRecognizing) return;

    recognitionIntervalRef.current = window.setInterval(() => {
      const candidates = registeredStudents.length > 0
        ? registeredStudents
        : [
            { student_id: 'S1001', name: 'Alex Johnson' } as Student,
            { student_id: 'S1002', name: 'Sophia Martinez' } as Student,
          ];

      const ri = Math.floor(Math.random() * (candidates.length + 1));
      const candidate = candidates[ri];

      if (!candidate) {
        setRecognition({ status: 'UNKNOWN', name: 'Unknown Face Detected', confidence: Math.floor(35 + Math.random() * 20) });
      } else {
        const confidence = Math.floor(87 + Math.random() * 12);
        setRecognition({ status: 'MATCHED', name: candidate.name, studentId: candidate.student_id, confidence });
        setMarkedRecords((prev) => {
          if (prev.some((r) => r.student_id === candidate.student_id)) return prev;
          return [...prev, {
            student_id: candidate.student_id,
            name: candidate.name,
            time: new Date().toLocaleTimeString(),
            confidence,
            status: 'PRESENT',
          }];
        });
      }
    }, 3000);

    return () => {
      if (recognitionIntervalRef.current) clearInterval(recognitionIntervalRef.current);
    };
  }, [cameraState, isRecognizing, registeredStudents]);

  useEffect(() => () => stopCamera(), []);

  const handleStartSession = () => {
    if (!selectedEntry) return;
    setSessionState('ACTIVE');
    setMarkedRecords([]);
    startCamera();
  };

  const handleEndSession = () => {
    stopCamera();
    setSessionState('ENDED');
    setShowEndConfirm(false);
    setCameraState('IDLE');
  };

  // ---- SELECTING VIEW ----
  if (sessionState === 'SELECTING') {
    return (
      <TeacherLayout title="Start Attendance" subtitle="Select a session to begin face recognition attendance">
        <Card>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Today's Sessions</h3>
          <p className="text-xs text-slate-500 mb-5">Select the session you want to start attendance for</p>

          {myTodayEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No sessions today</p>
              <p className="text-sm mt-1">Check your timetable for upcoming classes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTodayEntries.map((entry) => (
                <label
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedEntry?.id === entry.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="session"
                    className="accent-emerald-600 w-4 h-4"
                    checked={selectedEntry?.id === entry.id}
                    onChange={() => setSelectedEntry(entry)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.subject_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{entry.class_name} · {entry.room_number}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{entry.start_time} – {entry.end_time}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                      <Users className="w-3 h-3" />
                      {INITIAL_STUDENTS.filter((s) => s.class_id === entry.class_id && s.is_active).length} students
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {selectedEntry && (
            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
              <h4 className="font-semibold text-slate-900 dark:text-white">Session Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span><strong>Subject:</strong> {selectedEntry.subject_name}</span>
                <span><strong>Class:</strong> {selectedEntry.class_name}</span>
                <span><strong>Time:</strong> {selectedEntry.start_time} – {selectedEntry.end_time}</span>
                <span><strong>Room:</strong> {selectedEntry.room_number || 'N/A'}</span>
                <span><strong>Students:</strong> {totalStudents}</span>
                <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
              icon={<Play className="w-4 h-4" />}
              onClick={handleStartSession}
              disabled={!selectedEntry}
            >
              START ATTENDANCE SESSION
            </Button>
          </div>
        </Card>
      </TeacherLayout>
    );
  }

  // ---- ENDED VIEW ----
  if (sessionState === 'ENDED') {
    return (
      <TeacherLayout title="Session Ended" subtitle="Attendance session completed successfully">
        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Session Complete!</h3>
            <p className="text-sm text-slate-500 mt-1">{selectedEntry?.subject_name} · {selectedEntry?.class_name}</p>
            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                <p className="text-xs text-slate-500">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{absentCount}</p>
                <p className="text-xs text-slate-500">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
                </p>
                <p className="text-xs text-slate-500">Attendance</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Marked Students</h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
              {markedRecords.map((rec) => (
                <div key={rec.student_id} className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-900 dark:text-white">{rec.name}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="success" size="sm">PRESENT</Badge>
                    <p className="text-[10px] text-slate-400 mt-0.5">Conf: {rec.confidence}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500"
            onClick={() => { setSessionState('SELECTING'); setSelectedEntry(null); }}
          >
            Start Another Session
          </Button>
        </Card>
      </TeacherLayout>
    );
  }

  // ---- ACTIVE SESSION VIEW ----
  return (
    <TeacherLayout title="Live Attendance Session" subtitle={`${selectedEntry?.subject_name} · ${selectedEntry?.class_name}`}>
      {/* Session header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {cameraState === 'READY' && (
            <Badge variant="success" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
              LIVE
            </Badge>
          )}
          <span className="text-sm text-slate-500">{new Date().toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            icon={<Square className="w-3.5 h-3.5" />}
            onClick={() => setShowEndConfirm(true)}
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Main layout: camera + session info */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* LEFT: Camera — 16:9 */}
        <div className="lg:w-[62%]">
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800"
            style={{ aspectRatio: '16/9' }}>

            {/* Video element (always present, hidden until ready) */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraState === 'READY' ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* INITIALIZING state */}
            {cameraState === 'INITIALIZING' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-300">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                  <Camera className="w-9 h-9 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Starting camera...</p>
                  <p className="text-xs text-slate-400 mt-0.5">Initializing face recognition</p>
                </div>
                {/* Scan line */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent animate-scanBeam" />
                </div>
              </div>
            )}

            {/* TIMEOUT state */}
            {cameraState === 'TIMEOUT' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-slate-300">
                <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Camera taking longer than expected</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Ensure webcam is connected and not in use.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={startCamera}>Retry</Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Check browser camera permissions in the URL bar.')}>Permissions</Button>
                </div>
              </div>
            )}

            {/* ERROR state */}
            {cameraState === 'ERROR' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-slate-300">
                <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800">
                  <ShieldAlert className="w-8 h-8 text-rose-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Camera could not be started</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Device not detected or permission denied.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={startCamera}>Retry Camera</Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Check camera permissions in browser settings.')}>Check Permissions</Button>
                </div>
              </div>
            )}

            {/* READY: overlays */}
            {cameraState === 'READY' && (
              <>
                {/* Scan border */}
                <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-2xl pointer-events-none">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent animate-scanBeam" />
                </div>

                {/* Face bounding box */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-44 h-44 sm:w-56 sm:h-56 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between p-2 ${
                    recognition.status === 'MATCHED'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                      : recognition.status === 'UNKNOWN'
                      ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20'
                      : 'border-sky-400/60 border-dashed animate-pulse'
                  }`}>
                    <div className="flex justify-between text-[10px] font-mono text-white/80">
                      <span>LBPH v2</span>
                      <span>{recognition.confidence ? `${recognition.confidence}%` : 'Scanning...'}</span>
                    </div>
                    <div className="text-center pb-1">
                      {recognition.status === 'MATCHED' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/90 text-white rounded-lg text-xs font-bold animate-fadeInFast">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <div>
                            <div>{recognition.name}</div>
                            <div className="text-[9px] font-normal opacity-80">Attendance Marked</div>
                          </div>
                        </div>
                      )}
                      {recognition.status === 'UNKNOWN' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600/90 text-white rounded-lg text-xs font-bold animate-fadeInFast">
                          <UserX className="w-3.5 h-3.5" />
                          <div>
                            <div>Unknown face</div>
                            <div className="text-[9px] font-normal opacity-80">Not marked</div>
                          </div>
                        </div>
                      )}
                      {recognition.status === 'SCANNING' && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-900/80 text-sky-400 rounded-lg text-xs">
                          <Scan className="w-3 h-3 animate-spin" />
                          Scanning...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Camera ready badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="success" size="sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                    Camera Live
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Session info */}
        <div className="lg:w-[38%] space-y-4">
          {/* Session details */}
          <Card>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Session Details</h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subject</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedEntry?.subject_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Class</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedEntry?.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedEntry?.start_time} – {selectedEntry?.end_time}</span>
              </div>
              {selectedEntry?.room_number && (
                <div className="flex justify-between">
                  <span>Room</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedEntry.room_number}</span>
                </div>
              )}
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                <p className="text-[10px] text-slate-500">Present</p>
              </div>
              <div className="text-center p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{absentCount}</p>
                <p className="text-[10px] text-slate-500">Absent</p>
              </div>
              <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalStudents}</p>
                <p className="text-[10px] text-slate-500">Total</p>
              </div>
            </div>
          </Card>

          {/* Recently recognized */}
          <Card>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Recently Recognized ({markedRecords.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {markedRecords.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Awaiting face detection...</p>
              ) : (
                markedRecords.slice(-6).reverse().map((rec) => (
                  <div key={rec.student_id} className="flex items-center gap-2 text-xs animate-fadeInFast">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-900 dark:text-white truncate">{rec.name}</span>
                    <span className="text-slate-400 shrink-0">{rec.time}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Attendance Table */}
      <Card>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Attendance Table ({markedRecords.length} marked)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="text-left pb-3 font-semibold">Student</th>
                <th className="text-left pb-3 font-semibold hidden sm:table-cell">ID</th>
                <th className="text-left pb-3 font-semibold hidden md:table-cell">Time</th>
                <th className="text-right pb-3 font-semibold hidden sm:table-cell">Confidence</th>
                <th className="text-right pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {markedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 italic text-xs">
                    No attendance marked yet. Waiting for face recognition...
                  </td>
                </tr>
              ) : (
                markedRecords.map((rec) => (
                  <tr key={rec.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-900 dark:text-white">{rec.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-xs hidden sm:table-cell">{rec.student_id}</td>
                    <td className="py-3 text-slate-500 hidden md:table-cell">{rec.time}</td>
                    <td className="py-3 text-right hidden sm:table-cell">
                      <span className="text-xs text-slate-500">{rec.confidence}%</span>
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant="success" size="sm">PRESENT</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* End session confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 animate-scaleUpFast">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">End Attendance Session?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will finalize the session with {presentCount} present and {absentCount} absent students.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEndConfirm(false)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={handleEndSession}>End Session</Button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
};
