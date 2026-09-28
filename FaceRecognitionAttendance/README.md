# Face Recognition Attendance System

A Python project that registers students, captures their faces from a
webcam, trains an OpenCV LBPH face recognizer, and runs subject-wise
attendance sessions — marking attendance only after a face is confirmed
across several frames, and reporting Present/Absent/Total and per-subject
attendance percentage.

## Project Structure

```
FaceRecognitionAttendance/
│── main.py              # Student-facing menu (Phase 1/2, unchanged)
│── database.py          # Creates/upgrades SQLite database + ALL tables
│── register.py           # Student CRUD (register + admin view/edit/deactivate/delete)
│── capture.py            # Captures 20 face images from webcam
│── train.py              # Trains the OpenCV LBPH recognizer
│── recognize.py          # Runs an attendance session (detect + confirm + mark)
│── attendance.py          # Attendance/session/report logic (SQLite + CSV)
│── admin.py              # ADMIN entry point: login + Admin menu
│── admin_auth.py          # Admin password hashing, login check, change password
│── admin_teachers.py       # Teacher CRUD
│── admin_subjects.py       # Subject CRUD
│── admin_classes.py        # Class CRUD + student-to-class assignment
│── admin_timetable.py      # Timetable CRUD
│── requirements.txt
│── README.md
│
├── dataset/     # Captured face images (auto-created, per student folder)
├── trainer/     # trainer.yml + labels.pickle (auto-created)
├── attendance/  # One CSV per subject per day (auto-created)
├── database/    # SQLite database file (auto-created)
├── haarcascade/ # (Optional) put a custom haarcascade_frontalface_default.xml here
└── images/      # (Optional) folder for any extra snapshots you want to keep
```

All folders and the database are created (and safely upgraded) automatically
the first time you run the program.

## Requirements

- Python 3.8+
- A working webcam
- Only OpenCV is needed — no `face_recognition`/`dlib`, no C++ build tools.

## 1. Install Dependencies

```bash
pip install -r requirements.txt
```

## 2. Run the Program

```bash
python main.py
```

```
1. Register New Student
2. Capture Face Images
3. Train Model
4. Start Attendance Session
5. View Subject-wise Attendance
6. View Attendance History
7. View Student Attendance Percentage
8. Exit
```

## 3. Typical Workflow

1. **Register** each student (ID + Name) into the database.
2. **Capture Face Images** for each student — webcam saves 20 grayscale
   200×200 face photos into `dataset/<id>_<name>/`.
3. **Train Model** — builds `trainer/trainer.yml` from every student's photos.
4. **Start Attendance Session** — enter a subject name (e.g. `Math`), then the
   webcam opens. For every face in view:
   - It must be recognized as the **same student for 3 consecutive frames**
     before being trusted (avoids one-frame flickers/false positives).
   - Once confirmed, attendance is marked **once per student per session**
     (shown as "Present" on screen for the rest of that session) and **once
     per subject per day** in the database — attending Math and Physics the
     same day is fine; scanning Math twice the same day is not double-counted.
   - Faces that don't match anyone always show **"Unknown"** and are never
     marked, no matter how long they're in frame.
   - The on-screen bar shows the subject, how many students have been marked,
     and how many faces are currently in frame.
   - Press **q** to stop the session — a **Present / Absent / Total** report
     for that subject prints in the terminal (absentees are every registered
     student who wasn't seen).
5. **View Subject-wise Attendance** — every record ever logged for one subject.
6. **View Attendance History** — every record for one student (or everyone).
7. **View Attendance Percentage** — a student's attended sessions ÷ total
   sessions held for a subject, as a percentage.

## Admin Module

Run it separately from the student-facing program:

```bash
python admin.py
```

On first run, since no admin account exists yet, one is created automatically:

```
Username: admin
Password: admin123
```

**Change this immediately** via Admin Menu → option 7 (Change Password). The
password is never stored in plain text — it's hashed (SHA-256 + a random
salt per account) the instant it's set, and only the hash lives in the
`Admin` table.

```
ADMIN MENU
1. Dashboard          -> counts of students/teachers/subjects/classes/timetable entries
2. Manage Students     -> Add / View / Edit Name / Deactivate / Delete
3. Manage Teachers      -> Add / View / Edit Name / Deactivate / Delete
4. Manage Subjects      -> Add / View / Edit Name / Deactivate / Delete
5. Manage Classes       -> Add / View / Edit Name / Delete / Assign Student / View Students in Class
6. Manage Timetable     -> Add Entry / View / Edit / Delete
7. Change Password
8. Logout
```

**Safe deletion, everywhere:** deleting a Student, Teacher, or Subject is
**refused** if attendance/timetable data already depends on it — you get a
clear message and can **Deactivate** instead (a soft, reversible flag), so
no attendance history or timetable entry can ever be silently destroyed.
The same protection applies to Classes (blocked if students are still
assigned) and Timetable entries (blocked if an attendance session already
exists for that slot).

**Timetable:** each entry is `Class → Subject → Teacher → Day → Start → End`.
The same subject can be scheduled more than once on the same day — each
`Add Entry` simply creates another row, so e.g. two Java periods and one
DBMS period on Monday show up as three independent entries (see the flow
explanation below for why this matters).

## Database Schema

**Students**: `student_id` (PK), `name`, `class_id` (→ Classes), `is_active`

**Teachers**: `teacher_id` (PK), `name`, `is_active`

**Subjects**: `subject_code` (PK), `subject_name`, `is_active`

**Classes**: `class_id` (PK), `class_name`

**Timetable**: `id` (PK), `class_id` (→ Classes), `subject_code` (→ Subjects),
`teacher_id` (→ Teachers), `day_of_week`, `start_time`, `end_time`
— no uniqueness constraint on subject+day, so the same subject can repeat.

**AttendanceSessions**: `id` (PK), `timetable_id` (→ Timetable), `date`,
unique on `(timetable_id, date)` — one row per *actual occurrence* of a
scheduled class. Not yet written to by `recognize.py`; see "Timetable →
Attendance connection" below.

**Admin**: `id` (PK), `username`, `password_hash`, `salt`

**Sessions** (Phase 2, unchanged) — one row per subject+date a session was
started, used for the existing attendance-percentage calculation:
`id`, `subject`, `date`

**Attendance** (Phase 1/2, unchanged): `id`, `student_id`, `name`, `date`,
`time`, `subject`

All of this is created/upgraded automatically and safely — an existing
database with real students and attendance history keeps every row; only
new tables and new (nullable/defaulted) columns are added.

## Notes & Limitations

- **Attendance percentage** is based on the `Sessions` table, which only logs
  a session once you start one from this version onward. Attendance recorded
  before this update (migrated to subject `"General"`) won't count toward a
  session total, since no session was logged for it at the time.
- **CONFIDENCE_THRESHOLD** (in `recognize.py`, default `70`) controls how
  strict matching is — lower catches fewer false positives but may also miss
  real matches; raise it if real students keep showing as "Unknown".
- **CONFIRMATION_FRAMES** (in `recognize.py`, default `3`) controls how many
  consecutive frames are needed before marking — raise it for stricter/slower
  confirmation, lower it for faster/less strict confirmation.

## Troubleshooting

- **"Could not access the webcam"** – close other apps using the camera, or
  try `cv2.VideoCapture(1)` if you have more than one camera.
- **"No trained model found"** – run option 3 before option 4.
- **Real students keep showing "Unknown"** – capture more/better-lit photos,
  retrain, or raise `CONFIDENCE_THRESHOLD` slightly.
