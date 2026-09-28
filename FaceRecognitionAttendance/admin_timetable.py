from database import get_connection

VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def add_timetable_entry(class_id, subject_code, teacher_id, day_of_week, start_time, end_time):
    """Add one scheduled class period. Multiple entries with the SAME
    subject on the SAME day are allowed on purpose - each row is a
    separate, real class period (e.g. two Java periods on Monday)."""

    connection = get_connection()
    cursor = connection.cursor()

    # Basic existence checks so a typo doesn't silently create a broken entry
    for table, column, value in [
        ("Classes", "class_id", class_id),
        ("Subjects", "subject_code", subject_code),
        ("Teachers", "teacher_id", teacher_id),
    ]:
        cursor.execute(f"SELECT 1 FROM {table} WHERE {column} = ?", (value,))
        if cursor.fetchone() is None:
            connection.close()
            print(f"Error: {table[:-1]} '{value}' does not exist. Add it first.")
            return False

    cursor.execute("""
        INSERT INTO Timetable (class_id, subject_code, teacher_id, day_of_week, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (class_id, subject_code, teacher_id, day_of_week, start_time, end_time))
    connection.commit()
    connection.close()
    print(f"Timetable entry added: {day_of_week} {start_time}-{end_time} -> "
          f"{class_id} -> {subject_code} -> {teacher_id}")
    return True


def view_timetable(class_id=None, day_of_week=None):
    """Return timetable entries (optionally filtered by class and/or day),
    each joined with the subject name and teacher name for display, ordered
    so a day's schedule reads top-to-bottom by start time."""
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        SELECT Timetable.id, Timetable.day_of_week, Timetable.start_time, Timetable.end_time,
               Timetable.class_id, Timetable.subject_code, Timetable.teacher_id,
               Subjects.subject_name, Teachers.name
        FROM Timetable
        JOIN Subjects ON Timetable.subject_code = Subjects.subject_code
        JOIN Teachers ON Timetable.teacher_id = Teachers.teacher_id
        WHERE 1 = 1
    """
    params = []
    if class_id:
        query += " AND Timetable.class_id = ?"
        params.append(class_id)
    if day_of_week:
        query += " AND Timetable.day_of_week = ?"
        params.append(day_of_week)
    query += " ORDER BY Timetable.day_of_week, Timetable.start_time"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()
    return rows


def edit_timetable_entry(entry_id, day_of_week=None, start_time=None, end_time=None):
    """Update the day/time of an existing timetable entry (any argument left
    as None keeps its current value). Returns True if found and updated."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT day_of_week, start_time, end_time FROM Timetable WHERE id = ?", (entry_id,))
    row = cursor.fetchone()
    if row is None:
        connection.close()
        print(f"Error: Timetable entry {entry_id} not found.")
        return False

    new_day = day_of_week or row[0]
    new_start = start_time or row[1]
    new_end = end_time or row[2]

    cursor.execute(
        "UPDATE Timetable SET day_of_week = ?, start_time = ?, end_time = ? WHERE id = ?",
        (new_day, new_start, new_end, entry_id)
    )
    connection.commit()
    connection.close()
    return True


def delete_timetable_entry(entry_id):
    """Delete a timetable entry, but ONLY if no attendance session has
    already been recorded against it. Returns True if deleted."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM AttendanceSessions WHERE timetable_id = ?", (entry_id,))
    session_count = cursor.fetchone()[0]
    if session_count > 0:
        connection.close()
        print(f"Cannot delete: {session_count} attendance session(s) already exist "
              f"for this timetable entry.")
        return False

    cursor.execute("DELETE FROM Timetable WHERE id = ?", (entry_id,))
    deleted = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return deleted
