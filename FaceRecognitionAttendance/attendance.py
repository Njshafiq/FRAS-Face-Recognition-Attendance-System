import os
import csv
from datetime import datetime
from database import get_connection

ATTENDANCE_FOLDER = "attendance"


def start_session(subject):
    """Record that an attendance session was held for this subject today.
    Uses INSERT OR IGNORE so starting a second session for the same subject
    on the same day does not create a duplicate Sessions row.
    Returns today's date string."""
    today = datetime.now().strftime("%Y-%m-%d")

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO Sessions (subject, date) VALUES (?, ?) ON CONFLICT (subject, date) DO NOTHING",
        (subject, today)
    )
    connection.commit()
    connection.close()

    return today


def already_marked_today(student_id, subject):
    """Return True if this student's attendance for THIS subject was already
    recorded today (a student can attend more than one subject per day)."""
    today = datetime.now().strftime("%Y-%m-%d")

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT * FROM Attendance WHERE student_id = ? AND subject = ? AND date = ?",
        (student_id, subject, today)
    )
    result = cursor.fetchone()
    connection.close()

    return result is not None


def mark_attendance(student_id, name, subject):
    """Mark attendance for a student, for a specific subject, in both SQLite
    and a CSV file. Does nothing if already marked for this subject today.
    Returns True if newly marked, False if skipped (duplicate)."""

    if already_marked_today(student_id, subject):
        return False

    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    # 1. Save to SQLite
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO Attendance (student_id, name, date, time, subject) VALUES (?, ?, ?, ?, ?)",
        (student_id, name, date_str, time_str, subject)
    )
    connection.commit()
    connection.close()

    # 2. Save to CSV - one file per subject, per day
    os.makedirs(ATTENDANCE_FOLDER, exist_ok=True)
    safe_subject = subject.replace(" ", "_")
    csv_path = os.path.join(ATTENDANCE_FOLDER, f"{safe_subject}_{date_str}.csv")
    file_already_exists = os.path.exists(csv_path)

    with open(csv_path, mode="a", newline="") as csv_file:
        writer = csv.writer(csv_file)
        if not file_already_exists:
            writer.writerow(["Student ID", "Name", "Subject", "Date", "Time"])
        writer.writerow([student_id, name, subject, date_str, time_str])

    print(f"Attendance marked: {name} (ID: {student_id}) - {subject} at {time_str}")
    return True


def get_all_students():
    """Return a list of (student_id, name) for every registered student."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT student_id, name FROM Students")
    students = cursor.fetchall()
    connection.close()
    return students


def get_session_summary(subject, date=None):
    """Return Present / Absent / Total for a subject on a given date
    (defaults to today). Absent = every registered student not present."""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    all_students = get_all_students()
    total = len(all_students)

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT student_id, name FROM Attendance WHERE subject = ? AND date = ?",
        (subject, date)
    )
    present_rows = cursor.fetchall()
    connection.close()

    present_ids = {row[0] for row in present_rows}
    absent_list = [(sid, name) for sid, name in all_students if sid not in present_ids]

    return {
        "subject": subject,
        "date": date,
        "total": total,
        "present": len(present_ids),
        "absent": len(absent_list),
        "present_list": present_rows,
        "absent_list": absent_list,
    }


def get_subject_attendance(subject):
    """Return every attendance record ever recorded for one subject."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT student_id, name, date, time FROM Attendance WHERE subject = ? ORDER BY date, time",
        (subject,)
    )
    records = cursor.fetchall()
    connection.close()
    return records


def get_attendance_history(student_id=None):
    """Return attendance records, optionally filtered to one student."""
    connection = get_connection()
    cursor = connection.cursor()

    if student_id:
        cursor.execute(
            "SELECT student_id, name, subject, date, time FROM Attendance "
            "WHERE student_id = ? ORDER BY date, time",
            (student_id,)
        )
    else:
        cursor.execute(
            "SELECT student_id, name, subject, date, time FROM Attendance ORDER BY date, time"
        )

    records = cursor.fetchall()
    connection.close()
    return records


def get_attendance_percentage(student_id, subject):
    """Return this student's attendance percentage for a subject:
    (sessions attended) / (total sessions held for that subject) * 100."""

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM Sessions WHERE subject = ?", (subject,))
    total_sessions = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM Attendance WHERE student_id = ? AND subject = ?",
        (student_id, subject)
    )
    attended = cursor.fetchone()[0]

    connection.close()

    if total_sessions == 0:
        return 0.0

    return round((attended / total_sessions) * 100, 2)
