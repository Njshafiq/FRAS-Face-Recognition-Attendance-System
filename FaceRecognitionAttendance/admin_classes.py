import psycopg2
from database import get_connection


def add_class(class_id, class_name):
    """Add a new class (e.g. CSE-A). Returns True on success."""
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Classes (class_id, class_name) VALUES (?, ?)",
            (class_id, class_name)
        )
        connection.commit()
        print(f"Class added: {class_id} - {class_name}")
        return True
    except psycopg2.IntegrityError:
        connection.rollback()
        print(f"Error: Class ID '{class_id}' already exists.")
        return False
    finally:
        connection.close()


def view_classes():
    """Return every class as (class_id, class_name)."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT class_id, class_name FROM Classes")
    rows = cursor.fetchall()
    connection.close()
    return rows


def edit_class(class_id, new_name):
    """Update a class's display name. Returns True if a row was updated."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Classes SET class_name = ? WHERE class_id = ?", (new_name, class_id))
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated


def delete_class(class_id):
    """Delete a class, but ONLY if no students are assigned to it and no
    timetable entries use it. Returns True if deleted."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM Students WHERE class_id = ?", (class_id,))
    student_count = cursor.fetchone()[0]
    if student_count > 0:
        connection.close()
        print(f"Cannot delete: {student_count} student(s) are assigned to class '{class_id}'. "
              f"Reassign them first.")
        return False

    cursor.execute("SELECT COUNT(*) FROM Timetable WHERE class_id = ?", (class_id,))
    timetable_count = cursor.fetchone()[0]
    if timetable_count > 0:
        connection.close()
        print(f"Cannot delete: class '{class_id}' has {timetable_count} timetable entry(ies). "
              f"Remove them first.")
        return False

    cursor.execute("DELETE FROM Classes WHERE class_id = ?", (class_id,))
    deleted = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return deleted


def assign_student_to_class(student_id, class_id):
    """Assign an existing student to an existing class. Returns True on success."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT 1 FROM Students WHERE student_id = ?", (student_id,))
    if cursor.fetchone() is None:
        connection.close()
        print(f"Error: Student '{student_id}' not found.")
        return False

    cursor.execute("SELECT 1 FROM Classes WHERE class_id = ?", (class_id,))
    if cursor.fetchone() is None:
        connection.close()
        print(f"Error: Class '{class_id}' not found.")
        return False

    cursor.execute("UPDATE Students SET class_id = ? WHERE student_id = ?", (class_id, student_id))
    connection.commit()
    connection.close()
    print(f"Student {student_id} assigned to class {class_id}.")
    return True


def view_students_in_class(class_id):
    """Return every student assigned to a class as (student_id, name)."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT student_id, name FROM Students WHERE class_id = ?", (class_id,))
    rows = cursor.fetchall()
    connection.close()
    return rows
