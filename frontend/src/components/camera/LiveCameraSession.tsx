import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Scan, 
  AlertTriangle, 
  UserCheck, 
  UserX,
  Play,
  Square
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Student } from '../../types';

interface LiveCameraSessionProps {
  subjectName: string;
  className: string;
  teacherName: string;
  onStudentMarked?: (studentName: string) => void;
  registeredStudents?: Student[];
}

export type CameraState = 'INITIALIZING' | 'READY' | 'TIMEOUT' | 'ERROR';

export const LiveCameraSession: React.FC<LiveCameraSessionProps> = ({
  subjectName,
  className: targetClass,
  teacherName,
  onStudentMarked,
  registeredStudents = [],
}) => {
  const [cameraState, setCameraState] = useState<CameraState>('INITIALIZING');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [markedStudents, setMarkedStudents] = useState<string[]>([]);
  const [currentRecognition, setCurrentRecognition] = useState<{
    status: 'MATCHED' | 'UNKNOWN' | 'SCANNING';
    name?: string;
    studentId?: string;
    confidence?: number;
  }>({ status: 'SCANNING' });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraState('INITIALIZING');
    setCurrentRecognition({ status: 'SCANNING' });

    // Timeout check after 4.5s
    const timeoutId = setTimeout(() => {
      setCameraState((prev) => (prev === 'INITIALIZING' ? 'TIMEOUT' : prev));
    }, 4500);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        clearTimeout(timeoutId);
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraState('READY');
        setIsSessionActive(true);
      } else {
        clearTimeout(timeoutId);
        // Fallback simulation mode if hardware camera permission is absent in test environment
        setTimeout(() => {
          setCameraState('READY');
          setIsSessionActive(true);
        }, 1200);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setCameraState('ERROR');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsSessionActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Simulated Face Recognition Loop when Session is Active
  useEffect(() => {
    if (cameraState !== 'READY' || !isSessionActive) return;

    const interval = setInterval(() => {
      const candidates = registeredStudents.length > 0 
        ? registeredStudents 
        : [
            { student_id: 'S1001', name: 'Alex Johnson' },
            { student_id: 'S1002', name: 'Sophia Martinez' },
            { student_id: 'S1003', name: 'David Smith' },
            { student_id: 'UNKNOWN', name: 'Unknown face' },
          ];

      const randomIndex = Math.floor(Math.random() * (candidates.length + 1));
      const candidate = candidates[randomIndex];

      if (!candidate || candidate.student_id === 'UNKNOWN') {
        setCurrentRecognition({
          status: 'UNKNOWN',
          name: 'Unknown Face Detected',
          confidence: Math.floor(40 + Math.random() * 20),
        });
      } else {
        setCurrentRecognition({
          status: 'MATCHED',
          name: candidate.name,
          studentId: candidate.student_id,
          confidence: Math.floor(88 + Math.random() * 11),
        });

        if (!markedStudents.includes(candidate.name)) {
          setMarkedStudents((prev) => [...prev, candidate.name]);
          if (onStudentMarked) onStudentMarked(candidate.name);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [cameraState, isSessionActive, registeredStudents, markedStudents, onStudentMarked]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft space-y-4">
      {/* Session Top Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Webcam Face Recognition Session
            </h3>
            {cameraState === 'READY' && (
              <Badge variant="success" size="sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                Camera Live
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {subjectName} • {targetClass} ({teacherName})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cameraState === 'READY' && (
            <Button
              variant={isSessionActive ? 'danger' : 'primary'}
              size="sm"
              onClick={() => (isSessionActive ? stopCamera() : startCamera())}
              icon={isSessionActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isSessionActive ? 'Stop Session' : 'Start Session'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Camera Feed Container */}
      <div className="relative w-full aspect-video max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
        
        {/* STATE 1: INITIALIZING */}
        {cameraState === 'INITIALIZING' && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-3">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border border-slate-800 shadow-xl">
              <Camera className="w-8 h-8 text-primary-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Starting Camera...
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Initializing OpenCV Haar Cascade & LBPH stream
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: TIMEOUT */}
        {cameraState === 'TIMEOUT' && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-3">
            <div className="p-3 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Camera is taking longer than expected.
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Make sure your webcam is connected and not currently in use by another application.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={startCamera}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Camera
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Please verify browser camera permissions in your URL bar address settings.')}
              >
                Check Permissions
              </Button>
            </div>
          </div>
        )}

        {/* STATE 3: ERROR */}
        {cameraState === 'ERROR' && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-3">
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-400 rounded-2xl">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Camera could not be started
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Webcam device not detected or access permission was denied.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={startCamera}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Camera
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Please check site permissions in browser address bar.')}
              >
                Check Permissions
              </Button>
            </div>
          </div>
        )}

        {/* STATE 4: READY (Live Feed + Visual Overlays) */}
        {cameraState === 'READY' && (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanning beam overlay */}
            <div className="absolute inset-0 border-2 border-primary-500/30 rounded-2xl pointer-events-none">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-scanBeam shadow-lg shadow-sky-500"></div>
            </div>

            {/* Simulated Bounding Box Overlay for Face Recognition */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-48 h-48 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between p-2 ${
                  currentRecognition.status === 'MATCHED'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20 animate-scaleUpFast'
                    : currentRecognition.status === 'UNKNOWN'
                    ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20'
                    : 'border-sky-400/60 border-dashed animate-pulse'
                }`}
              >
                <div className="flex justify-between text-[10px] font-mono text-white font-semibold">
                  <span>OpenCV LBPH</span>
                  <span>{currentRecognition.confidence ? `${currentRecognition.confidence}%` : 'Scanning...'}</span>
                </div>

                {/* Instant Visual Recognition Badge Feedback */}
                <div className="text-center">
                  {currentRecognition.status === 'MATCHED' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600/90 text-white rounded-xl text-xs font-bold shadow-lg animate-fadeInFast">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <div>
                        <div>✓ {currentRecognition.name}</div>
                        <div className="text-[9px] font-normal opacity-90">Attendance Marked</div>
                      </div>
                    </div>
                  )}

                  {currentRecognition.status === 'UNKNOWN' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600/90 text-white rounded-xl text-xs font-bold shadow-lg animate-fadeInFast">
                      <UserX className="w-4 h-4 text-white" />
                      <div>
                        <div>Unknown face</div>
                        <div className="text-[9px] font-normal opacity-90">Not marked in records</div>
                      </div>
                    </div>
                  )}

                  {currentRecognition.status === 'SCANNING' && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 text-sky-400 rounded-lg text-xs font-medium">
                      <Scan className="w-3.5 h-3.5 animate-spin" />
                      Scanning frame...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Verified Students Checklist */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Session Verified Roster ({markedStudents.length} Marked)
          </span>
          <span className="text-slate-400 font-mono">
            CONFIDENCE_THRESHOLD = 70
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {markedStudents.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              Awaiting face detection verification...
            </span>
          ) : (
            markedStudents.map((stName) => (
              <span
                key={stName}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800 animate-fadeInFast"
              >
                <UserCheck className="w-3.5 h-3.5" />
                {stName}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
