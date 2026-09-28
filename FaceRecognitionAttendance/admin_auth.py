import hashlib
import secrets
from database import get_connection

# This is the ONLY place a default password is ever written down, and it is
# hashed immediately before being stored - the plain text never touches the
# database or any other file.
DEFAULT_USERNAME = "admin"
DEFAULT_PASSWORD = "admin123"


def _hash_password(password, salt):
    """Turn a plain password + salt into a one-way hash. The same input
    always produces the same hash, but a hash cannot be reversed back into
    the original password."""
    return hashlib.sha256((salt + password).encode()).hexdigest()


def ensure_default_admin():
    """If no admin account exists yet, create one with a default username
    and password. Safe to call every startup - does nothing once an admin
    already exists."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM Admin")
    admin_count = cursor.fetchone()[0]

    if admin_count == 0:
        salt = secrets.token_hex(8)
        password_hash = _hash_password(DEFAULT_PASSWORD, salt)
        cursor.execute(
            "INSERT INTO Admin (username, password_hash, salt) VALUES (?, ?, ?)",
            (DEFAULT_USERNAME, password_hash, salt)
        )
        connection.commit()
        print(f"No admin account found - created one (username: '{DEFAULT_USERNAME}', "
              f"password: '{DEFAULT_PASSWORD}').")
        print("Please change this password after logging in (Admin Menu > Change Password).")

    connection.close()


def verify_login(username, password):
    """Check a username/password against the stored hash.
    Returns True if correct, False otherwise. The plain password is never
    stored or compared directly - only its hash is."""
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT password_hash, salt FROM Admin WHERE username = ?", (username,))
    row = cursor.fetchone()
    connection.close()

    if row is None:
        return False

    stored_hash, salt = row
    return _hash_password(password, salt) == stored_hash


def change_password(username, new_password):
    """Update an admin's password, hashed with a brand new random salt.
    Returns True if an account was updated."""
    salt = secrets.token_hex(8)
    password_hash = _hash_password(new_password, salt)

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE Admin SET password_hash = ?, salt = ? WHERE username = ?",
        (password_hash, salt, username)
    )
    updated = cursor.rowcount > 0
    connection.commit()
    connection.close()
    return updated
