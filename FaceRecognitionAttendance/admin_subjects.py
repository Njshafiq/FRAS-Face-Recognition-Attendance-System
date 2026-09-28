import psycopg2
from database import get_connection


def add_subject(subject_code, subject_name):
    """Add a new subject. Returns True on success, False if the code is taken."""
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Subjects (subject_code, subject_name) VALUES (?, ?)",
            (subject_code, subject_name)
        )
        connection.commit()
        print(f"Subject added: {subject_code} - {subject_name}")
        return True
    except psycopg2.IntegrityError:
        connection.rollback()
        print(f"Error: Subject code '{subject_code}' already exists.")
        return False
    finally:
        connection.close()


def view_subjects():
    """Return every subject as (subject_code, subject_name, is_active)."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT subject_code, subject_name, is_active FROM Subjects")
    rows = cursor.fetchall()
    connection.close()
    return rows


def edit_subject(subject_code, new_name):
    """Update a subject's name. Returns True if a row was updated."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Subjects SET subject_name = ? WHERE subject_code = ?", (new_name, subject_code))
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated


def set_subject_active(subject_code, is_active):
    """Activate or deactivate a subject (soft delete). Returns True if updated."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE Subjects SET is_active = ? WHERE subject_code = ?",
        (1 if is_active else 0, subject_code)
    )
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated


def delete_subject(subject_code):
    """Hard-delete a subject, but ONLY if no timetable entry uses it.
    Otherwise refuse and suggest deactivating instead. Returns True if deleted."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM Timetable WHERE subject_code = ?", (subject_code,))
    timetable_count = cursor.fetchone()[0]

    if timetable_count > 0:
        connection.close()
        print(f"Cannot delete: subject '{subject_code}' is used in {timetable_count} "
              f"timetable entry(ies). Deactivate instead.")
        return False

    cursor.execute("DELETE FROM Subjects WHERE subject_code = ?", (subject_code,))
    deleted = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return deleted
