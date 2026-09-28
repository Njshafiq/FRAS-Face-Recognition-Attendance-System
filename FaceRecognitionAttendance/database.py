import os
import psycopg2

# ---------- Connection settings (override via environment variables) ----------
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "attendance_system")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")


# ---------- Compatibility layer ----------
# All the OTHER files in this project (register.py, attendance.py,
# admin_*.py) were written for sqlite3, which uses "?" as a placeholder
# in queries, e.g. "SELECT * FROM Students WHERE student_id = ?".
# PostgreSQL's driver (psycopg2) instead uses "%s". Rather than editing
# every query in every file, these two small wrapper classes translate
# "?" -> "%s" automatically, so all existing query code keeps working
# completely unchanged.

class _QmarkCursor:
    """Wraps a real psycopg2 cursor and translates '?' placeholders to '%s'."""

    def __init__(self, real_cursor):
        self._cursor = real_cursor

    def execute(self, query, params=None):
        translated_query = query.replace("?", "%s")
        if params is None:
            self._cursor.execute(translated_query)
        else:
            self._cursor.execute(translated_query, params)

    def __getattr__(self, name):
        # Anything not overridden above (fetchone, fetchall, rowcount, ...)
        # is passed straight through to the real psycopg2 cursor.
        return getattr(self._cursor, name)


class _QmarkConnection:
    """Wraps a real psycopg2 connection so .cursor() returns a _QmarkCursor."""

    def __init__(self, real_connection):
        self._connection = real_connection

    def cursor(self):
        return _QmarkCursor(self._connection.cursor())

    def __getattr__(self, name):
        # commit(), rollback(), close(), etc. pass straight through.
        return getattr(self._connection, name)


def _ensure_database_exists():
    """Connect to PostgreSQL's default 'postgres' maintenance database and
    create our target database if it doesn't exist yet. Safe to call every
    startup - does nothing once the database already exists."""
    try:
        admin_connection = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname="postgres",
            user=DB_USER, password=DB_PASSWORD
        )
        admin_connection.autocommit = True  # CREATE DATABASE can't run inside a transaction
        admin_cursor = admin_connection.cursor()
        admin_cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
        if admin_cursor.fetchone() is None:
            admin_cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"Created PostgreSQL database '{DB_NAME}'.")
        admin_cursor.close()
        admin_connection.close()
    except Exception as error:
        print(f"Warning: could not auto-create database '{DB_NAME}' ({error}).")
        print(f"Make sure PostgreSQL is running and reachable, or create it "
              f"manually with: createdb {DB_NAME}")


def get_connection():
    """Return a new PostgreSQL connection (wrapped so '?' placeholders in
    existing queries keep working). Used by every other file to talk to
    the database - the public interface is unchanged from the SQLite version."""
    real_connection = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASSWORD
    )
    return _QmarkConnection(real_connection)


def create_database():
    """Create every required table if it does not already exist, and the
    database itself if needed. Also safely upgrades an EXISTING database
    (new tables/columns via IF NOT EXISTS) WITHOUT ever deleting existing data."""

    _ensure_database_exists()

    connection = get_connection()
    cursor = connection.cursor()

    # ---------- Phase 1 / 2 tables (same structure as before) ----------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Students (
            student_id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Attendance (
            id SERIAL PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES Students (student_id),
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Sessions (
            id SERIAL PRIMARY KEY,
            subject TEXT NOT NULL,
            date TEXT NOT NULL,
            UNIQUE(subject, date)
        )
    """)

    cursor.execute("ALTER TABLE Attendance ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'General'")

    # ---------- Admin module tables ----------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Admin (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Teachers (
            teacher_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Subjects (
            subject_code TEXT PRIMARY KEY,
            subject_name TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Classes (
            class_id TEXT PRIMARY KEY,
            class_name TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Timetable (
            id SERIAL PRIMARY KEY,
            class_id TEXT NOT NULL REFERENCES Classes (class_id),
            subject_code TEXT NOT NULL REFERENCES Subjects (subject_code),
            teacher_id TEXT NOT NULL REFERENCES Teachers (teacher_id),
            day_of_week TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL
        )
    """)

    # One row per REAL occurrence of a timetable slot on a specific date -
    # see admin_timetable.py / README for why this supports repeated
    # same-day subjects correctly.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS AttendanceSessions (
            id SERIAL PRIMARY KEY,
            timetable_id INTEGER NOT NULL REFERENCES Timetable (id),
            date TEXT NOT NULL,
            UNIQUE(timetable_id, date)
        )
    """)

    # Safe migrations for admin-related columns on the existing Students table
    cursor.execute("ALTER TABLE Students ADD COLUMN IF NOT EXISTS class_id TEXT")
    cursor.execute("ALTER TABLE Students ADD COLUMN IF NOT EXISTS is_active INTEGER NOT NULL DEFAULT 1")

    connection.commit()
    connection.close()
    print("Database and tables are ready.")


if __name__ == "__main__":
    create_database()
