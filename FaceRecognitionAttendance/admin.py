from database import create_database
from admin_auth import ensure_default_admin, verify_login, change_password
from register import (
    register_student, view_students, edit_student,
    set_student_active, delete_student_safely,
)
from admin_teachers import (
    add_teacher, view_teachers, edit_teacher, set_teacher_active, delete_teacher,
)
from admin_subjects import (
    add_subject, view_subjects, edit_subject, set_subject_active, delete_subject,
)
from admin_classes import (
    add_class, view_classes, edit_class, delete_class,
    assign_student_to_class, view_students_in_class,
)
from admin_timetable import (
    add_timetable_entry, view_timetable, edit_timetable_entry,
    delete_timetable_entry, VALID_DAYS,
)


def login():
    """Ask for username/password up to 3 times. Returns the username on
    success, or None if all attempts fail."""
    print("\n===== Admin Login =====")
    for attempt in range(3):
        username = input("Username: ").strip()
        password = input("Password: ").strip()
        if verify_login(username, password):
            print(f"Welcome, {username}!")
            return username
        print("Invalid username or password.")
    print("Too many failed attempts. Exiting.")
    return None


def show_menu():
    print("\n===== ADMIN MENU =====")
    print("1. Dashboard")
    print("2. Manage Students")
    print("3. Manage Teachers")
    print("4. Manage Subjects")
    print("5. Manage Classes")
    print("6. Manage Timetable")
    print("7. Change Password")
    print("8. Logout")


def show_dashboard():
    students = view_students()
    teachers = view_teachers()
    subjects = view_subjects()
    classes = view_classes()
    timetable = view_timetable()

    print("\n--- Dashboard ---")
    print(f"Students: {len(students)}")
    print(f"Teachers: {len(teachers)}")
    print(f"Subjects: {len(subjects)}")
    print(f"Classes: {len(classes)}")
    print(f"Timetable entries: {len(timetable)}")


def manage_students():
    while True:
        print("\n--- Manage Students ---")
        print("1. Add  2. View  3. Edit Name  4. Deactivate  5. Delete  6. Back")
        choice = input("Choice: ").strip()

        if choice == "1":
            sid = input("Student ID: ").strip()
            name = input("Name: ").strip()
            register_student(sid, name)

        elif choice == "2":
            rows = view_students()
            if not rows:
                print("No students registered yet.")
            for sid, name, class_id, is_active in rows:
                status = "Active" if is_active else "Inactive"
                print(f"{sid} - {name} - Class: {class_id or '-'} - {status}")

        elif choice == "3":
            sid = input("Student ID to edit: ").strip()
            new_name = input("New name: ").strip()
            print("Updated." if edit_student(sid, new_name) else "Student not found.")

        elif choice == "4":
            sid = input("Student ID to deactivate: ").strip()
            print("Deactivated." if set_student_active(sid, False) else "Student not found.")

        elif choice == "5":
            sid = input("Student ID to delete: ").strip()
            delete_student_safely(sid)

        elif choice == "6":
            break
        else:
            print("Invalid choice.")


def manage_teachers():
    while True:
        print("\n--- Manage Teachers ---")
        print("1. Add  2. View  3. Edit Name  4. Deactivate  5. Delete  6. Back")
        choice = input("Choice: ").strip()

        if choice == "1":
            tid = input("Teacher ID: ").strip()
            name = input("Name: ").strip()
            add_teacher(tid, name)

        elif choice == "2":
            rows = view_teachers()
            if not rows:
                print("No teachers added yet.")
            for tid, name, is_active in rows:
                status = "Active" if is_active else "Inactive"
                print(f"{tid} - {name} - {status}")

        elif choice == "3":
            tid = input("Teacher ID to edit: ").strip()
            new_name = input("New name: ").strip()
            print("Updated." if edit_teacher(tid, new_name) else "Teacher not found.")

        elif choice == "4":
            tid = input("Teacher ID to deactivate: ").strip()
            print("Deactivated." if set_teacher_active(tid, False) else "Teacher not found.")

        elif choice == "5":
            tid = input("Teacher ID to delete: ").strip()
            delete_teacher(tid)

        elif choice == "6":
            break
        else:
            print("Invalid choice.")


def manage_subjects():
    while True:
        print("\n--- Manage Subjects ---")
        print("1. Add  2. View  3. Edit Name  4. Deactivate  5. Delete  6. Back")
        choice = input("Choice: ").strip()

        if choice == "1":
            code = input("Subject Code: ").strip()
            name = input("Subject Name: ").strip()
            add_subject(code, name)

        elif choice == "2":
            rows = view_subjects()
            if not rows:
                print("No subjects added yet.")
            for code, name, is_active in rows:
                status = "Active" if is_active else "Inactive"
                print(f"{code} - {name} - {status}")

        elif choice == "3":
            code = input("Subject Code to edit: ").strip()
            new_name = input("New name: ").strip()
            print("Updated." if edit_subject(code, new_name) else "Subject not found.")

        elif choice == "4":
            code = input("Subject Code to deactivate: ").strip()
            print("Deactivated." if set_subject_active(code, False) else "Subject not found.")

        elif choice == "5":
            code = input("Subject Code to delete: ").strip()
            delete_subject(code)

        elif choice == "6":
            break
        else:
            print("Invalid choice.")


def manage_classes():
    while True:
        print("\n--- Manage Classes ---")
        print("1. Add  2. View  3. Edit Name  4. Delete  5. Assign Student  6. View Students in Class  7. Back")
        choice = input("Choice: ").strip()

        if choice == "1":
            cid = input("Class ID (e.g. CSE-A): ").strip()
            name = input("Class Name: ").strip()
            add_class(cid, name)

        elif choice == "2":
            rows = view_classes()
            if not rows:
                print("No classes added yet.")
            for cid, name in rows:
                print(f"{cid} - {name}")

        elif choice == "3":
            cid = input("Class ID to edit: ").strip()
            new_name = input("New name: ").strip()
            print("Updated." if edit_class(cid, new_name) else "Class not found.")

        elif choice == "4":
            cid = input("Class ID to delete: ").strip()
            delete_class(cid)

        elif choice == "5":
            sid = input("Student ID: ").strip()
            cid = input("Class ID: ").strip()
            assign_student_to_class(sid, cid)

        elif choice == "6":
            cid = input("Class ID: ").strip()
            rows = view_students_in_class(cid)
            if not rows:
                print("No students in this class.")
            for sid, name in rows:
                print(f"{sid} - {name}")

        elif choice == "7":
            break
        else:
            print("Invalid choice.")


def manage_timetable():
    while True:
        print("\n--- Manage Timetable ---")
        print("1. Add Entry  2. View Timetable  3. Edit Entry  4. Delete Entry  5. Back")
        choice = input("Choice: ").strip()

        if choice == "1":
            cid = input("Class ID: ").strip()
            subject_code = input("Subject Code: ").strip()
            teacher_id = input("Teacher ID: ").strip()
            day = input(f"Day ({'/'.join(VALID_DAYS)}): ").strip().capitalize()
            if day not in VALID_DAYS:
                print("Invalid day.")
                continue
            start = input("Start time (HH:MM): ").strip()
            end = input("End time (HH:MM): ").strip()
            add_timetable_entry(cid, subject_code, teacher_id, day, start, end)

        elif choice == "2":
            cid = input("Filter by Class ID (blank for all): ").strip() or None
            day = input("Filter by Day (blank for all): ").strip().capitalize() or None
            rows = view_timetable(cid, day)
            if not rows:
                print("No timetable entries found.")
            for entry_id, day_of_week, start, end, class_id, subject_code, teacher_id, subject_name, teacher_name in rows:
                print(f"[{entry_id}] {day_of_week} {start}-{end} -> {class_id} -> {subject_name} -> {teacher_name}")

        elif choice == "3":
            entry_id = input("Entry ID to edit: ").strip()
            start = input("New start time (blank = keep): ").strip() or None
            end = input("New end time (blank = keep): ").strip() or None
            if not entry_id.isdigit():
                print("Entry ID must be a number.")
                continue
            edit_timetable_entry(int(entry_id), start_time=start, end_time=end)

        elif choice == "4":
            entry_id = input("Entry ID to delete: ").strip()
            if not entry_id.isdigit():
                print("Entry ID must be a number.")
                continue
            delete_timetable_entry(int(entry_id))

        elif choice == "5":
            break
        else:
            print("Invalid choice.")


def main():
    create_database()
    ensure_default_admin()

    username = login()
    if username is None:
        return

    while True:
        show_menu()
        choice = input("Enter your choice (1-8): ").strip()

        if choice == "1":
            show_dashboard()
        elif choice == "2":
            manage_students()
        elif choice == "3":
            manage_teachers()
        elif choice == "4":
            manage_subjects()
        elif choice == "5":
            manage_classes()
        elif choice == "6":
            manage_timetable()
        elif choice == "7":
            new_password = input("New password: ").strip()
            change_password(username, new_password)
            print("Password changed.")
        elif choice == "8":
            print("Logging out. Goodbye!")
            break
        else:
            print("Invalid choice.")


if __name__ == "__main__":
    main()
