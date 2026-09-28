from database import create_database
from register import register_student
from capture import capture_faces
from train import train_model
from recognize import recognize_faces
from attendance import (
    get_subject_attendance,
    get_attendance_history,
    get_attendance_percentage,
)


def show_menu():
    print("\n===== Face Recognition Attendance System =====")
    print("1. Register New Student")
    print("2. Capture Face Images")
    print("3. Train Model")
    print("4. Start Attendance Session")
    print("5. View Subject-wise Attendance")
    print("6. View Attendance History")
    print("7. View Student Attendance Percentage")
    print("8. Exit")


def print_session_summary(summary):
    """Print the Present / Absent / Total report after a session ends."""
    if not summary:
        return

    print(f"\n--- Session Summary: {summary['subject']} ({summary['date']}) ---")
    print(f"Total Students: {summary['total']}")
    print(f"Present: {summary['present']}")
    print(f"Absent: {summary['absent']}")

    if summary["absent_list"]:
        print("Absent students:")
        for student_id, name in summary["absent_list"]:
            print(f"  - {student_id}: {name}")


def main():
    create_database()  # make sure the database and tables exist/are up to date

    while True:
        show_menu()
        choice = input("Enter your choice (1-8): ").strip()

        if choice == "1":
            student_id = input("Enter Student ID: ").strip()
            name = input("Enter Student Name: ").strip()
            if student_id and name:
                register_student(student_id, name)
            else:
                print("Student ID and Name cannot be empty.")

        elif choice == "2":
            student_id = input("Enter Student ID: ").strip()
            name = input("Enter Student Name: ").strip()
            capture_faces(student_id, name)

        elif choice == "3":
            train_model()

        elif choice == "4":
            subject = input("Enter subject name: ").strip()
            if not subject:
                print("Subject name cannot be empty.")
            else:
                summary = recognize_faces(subject)
                print_session_summary(summary)

        elif choice == "5":
            subject = input("Enter subject name: ").strip()
            records = get_subject_attendance(subject)
            if not records:
                print(f"No attendance records found for '{subject}'.")
            else:
                print(f"\n--- Attendance for {subject} ---")
                for student_id, name, date, time in records:
                    print(f"{date} {time} - {student_id}: {name}")

        elif choice == "6":
            student_id = input("Enter Student ID (leave blank for all students): ").strip()
            records = get_attendance_history(student_id if student_id else None)
            if not records:
                print("No attendance history found.")
            else:
                print("\n--- Attendance History ---")
                for student_id, name, subject, date, time in records:
                    print(f"{date} {time} - {student_id}: {name} - {subject}")

        elif choice == "7":
            student_id = input("Enter Student ID: ").strip()
            subject = input("Enter subject name: ").strip()
            percentage = get_attendance_percentage(student_id, subject)
            print(f"Attendance percentage for {student_id} in {subject}: {percentage}%")

        elif choice == "8":
            print("Exiting program. Goodbye!")
            break

        else:
            print("Invalid choice. Please enter a number between 1 and 8.")


if __name__ == "__main__":
    main()
