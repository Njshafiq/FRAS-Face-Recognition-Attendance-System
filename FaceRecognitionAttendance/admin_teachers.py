import psycopg2
from database import get_connection


def add_teacher(teacher_id, name):
    """Add a new teacher. Returns True on success, False if the ID is taken."""
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Teachers (teacher_id, name) VALUES (?, ?)",
            (teacher_id, name)
        )
        connection.commit()
        print(f"Teacher added: {teacher_id} - {name}")
        return True
    except psycopg2.IntegrityError:
        connection.rollback()
        print(f"Error: Teacher ID '{teacher_id}' already exists.")
        return False
    finally:
        connection.close()


def view_teachers():
    """Return every teacher as (teacher_id, name, is_active)."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT teacher_id, name, is_active FROM Teachers")
    rows = cursor.fetchall()
    connection.close()
    return rows


def edit_teacher(teacher_id, new_name):
    """Update a teacher's name. Returns True if a row was updated."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Teachers SET name = ? WHERE teacher_id = ?", (new_name, teacher_id))
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated


def set_teacher_active(teacher_id, is_active):
    """Activate or deactivate a teacher (soft delete). Returns True if updated."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE Teachers SET is_active = ? WHERE teacher_id = ?",
        (1 if is_active else 0, teacher_id)
    )
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated


def delete_teacher(teacher_id):
    """Hard-delete a teacher, but ONLY if no timetable entry uses them.
    Otherwise refuse and suggest deactivating instead. Returns True if deleted."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM Timetable WHERE teacher_id = ?", (teacher_id,))
    timetable_count = cursor.fetchone()[0]

    if timetable_count > 0:
        connection.close()
        print(f"Cannot delete: teacher '{teacher_id}' is used in {timetable_count} "
              f"timetable entry(ies). Deactivate instead.")
        return False

    cursor.execute("DELETE FROM Teachers WHERE teacher_id = ?", (teacher_id,))
    deleted = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return deleted
