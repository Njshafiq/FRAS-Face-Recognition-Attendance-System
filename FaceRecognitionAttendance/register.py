import psycopg2
from database import create_database, get_connection


def register_student(student_id, name):
    """Insert a new student into the Students table.
    Returns True if registration succeeded, False otherwise."""
    create_database()

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO Students (student_id, name) VALUES (?, ?)",
            (student_id, name)
        )
        connection.commit()
        print(f"Student registered successfully: ID={student_id}, Name={name}")
        return True

    except psycopg2.IntegrityError:
        connection.rollback()
        print(f"Error: Student ID '{student_id}' is already registered.")
        return False

    except Exception as error:
        print(f"Error while registering student: {error}")
        return False

    finally:
        connection.close()


def view_students():
    """Return every student as (student_id, name, class_id, is_active).
    Used by the Admin module to list students."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT student_id, name, class_id, is_active FROM Students")
    rows = cursor.fetchall()
    connection.close()
    return rows


def edit_student(student_id, new_name):
    """Update a student's name. Returns True if a row was updated."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Students SET name = ? WHERE student_id = ?", (new_name, student_id))
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated


def set_student_active(student_id, is_active):
    """Activate or deactivate a student (soft delete). Returns True if updated."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE Students SET is_active = ? WHERE student_id = ?",
        (1 if is_active else 0, student_id)
    )
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated


def delete_student_safely(student_id):
    """Delete a student ONLY if they have no attendance history.
    If they do, refuse and suggest deactivating instead - this is what
    stops attendance records from ever being accidentally destroyed.
    Returns True if deleted."""
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM Attendance WHERE student_id = ?", (student_id,))
    attendance_count = cursor.fetchone()[0]

    if attendance_count > 0:
        connection.close()
        print(f"Cannot delete: student '{student_id}' has {attendance_count} attendance "
              f"record(s). Use 'Deactivate' instead to preserve attendance history.")
        return False

    cursor.execute("DELETE FROM Students WHERE student_id = ?", (student_id,))
    deleted = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return deleted


if __name__ == "__main__":
    student_id = input("Enter Student ID: ").strip()
    name = input("Enter Student Name: ").strip()

    if student_id == "" or name == "":
        print("Student ID and Name cannot be empty.")
    else:
        register_student(student_id, name)
