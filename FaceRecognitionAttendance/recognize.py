import os
import pickle
import cv2
from attendance import mark_attendance, start_session, get_session_summary

TRAINER_FOLDER = "trainer"
MODEL_PATH = os.path.join(TRAINER_FOLDER, "trainer.yml")
LABELS_PATH = os.path.join(TRAINER_FOLDER, "labels.pickle")
LOCAL_CASCADE_PATH = "haarcascade/haarcascade_frontalface_default.xml"

# LBPH confidence: LOWER means a BETTER match (0 = perfect match).
CONFIDENCE_THRESHOLD = 70
# A face's label must be recognized this many frames IN A ROW before we
# trust it enough to mark attendance. This filters out one-off flickers.
CONFIRMATION_FRAMES = 3


def get_cascade_path():
    """Return the path to the Haar Cascade face detector file."""
    if os.path.exists(LOCAL_CASCADE_PATH):
        return LOCAL_CASCADE_PATH
    return cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


def load_model():
    """Load the trained LBPH model and the label -> (student_id, name) map.
    Returns (None, None) on any problem instead of crashing."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(LABELS_PATH):
        print("Error: No trained model found. Please run 'Train Model' first.")
        return None, None

    try:
        recognizer = cv2.face.LBPHFaceRecognizer_create()
        recognizer.read(MODEL_PATH)

        with open(LABELS_PATH, "rb") as file:
            label_map = pickle.load(file)

        return recognizer, label_map

    except Exception as error:
        print(f"Error: Could not load the trained model ({error}). Please re-run 'Train Model'.")
        return None, None


def recognize_faces(subject):
    """Run one attendance session for the given subject.

    Opens the webcam, detects faces every frame, and only marks attendance
    once a face has been recognized as the SAME student for CONFIRMATION_FRAMES
    frames in a row. Handles multiple faces at once, never marks 'Unknown',
    and never marks the same student twice in one session. Stops when the
    user presses 'q', and always cleans up the camera/window afterwards."""

    recognizer, label_map = load_model()
    if recognizer is None:
        return None

    cascade_path = get_cascade_path()
    face_detector = cv2.CascadeClassifier(cascade_path)
    if face_detector.empty():
        print(f"Error: Could not load face detector from {cascade_path}")
        return None

    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        print("Error: Could not access the webcam.")
        return None

    session_date = start_session(subject)

    # label -> how many CONSECUTIVE frames that label was just recognized in
    consecutive_counts = {}
    # student_ids already handled this session, so we stop re-checking them
    marked_this_session = set()

    print(f"Session started for '{subject}'. Press 'q' to stop.")

    try:
        while True:
            success, frame = camera.read()
            if not success:
                print("Error: Lost connection to the webcam.")
                break

            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5)

            labels_seen_this_frame = set()

            # --- handle every face detected in this frame, one at a time ---
            for (x, y, w, h) in faces:
                face_crop = cv2.resize(gray_frame[y:y + h, x:x + w], (200, 200))

                try:
                    label, confidence = recognizer.predict(face_crop)
                except Exception:
                    label, confidence = -1, 999  # treat a prediction error as "Unknown"

                recognized = confidence < CONFIDENCE_THRESHOLD and label in label_map

                if recognized:
                    student_id, name = label_map[label]
                    labels_seen_this_frame.add(label)
                    consecutive_counts[label] = consecutive_counts.get(label, 0) + 1

                    if student_id in marked_this_session:
                        status_text = f"{name} - Present"
                        box_color = (0, 255, 0)

                    elif consecutive_counts[label] >= CONFIRMATION_FRAMES:
                        newly_marked = mark_attendance(student_id, name, subject)
                        marked_this_session.add(student_id)
                        status_text = f"{name} - Attendance Marked!" if newly_marked else f"{name} - Already Present"
                        box_color = (0, 255, 0)

                    else:
                        status_text = f"{name} - Confirming ({consecutive_counts[label]}/{CONFIRMATION_FRAMES})"
                        box_color = (0, 200, 255)

                else:
                    # Unknown faces are NEVER marked and NEVER get a counter
                    status_text = "Unknown"
                    box_color = (0, 0, 255)

                cv2.rectangle(frame, (x, y), (x + w, y + h), box_color, 2)
                cv2.putText(frame, status_text, (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)

            # Reset the streak for any known label NOT seen in this frame
            # (so a brief disappearance doesn't carry over a stale streak)
            for label in list(consecutive_counts.keys()):
                if label not in labels_seen_this_frame:
                    consecutive_counts[label] = 0

            # --- real-time status bar ---
            status_line = f"Subject: {subject} | Marked: {len(marked_this_session)} | Faces in frame: {len(faces)}"
            cv2.putText(frame, status_line, (10, 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, "Press 'q' to stop session", (10, frame.shape[0] - 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            cv2.imshow("Face Recognition Attendance - Press 'q' to quit", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        # This ALWAYS runs, even if something above raised an error,
        # so the camera and window never get left open.
        camera.release()
        cv2.destroyAllWindows()

    print(f"Session stopped for '{subject}'.")
    return get_session_summary(subject, session_date)


if __name__ == "__main__":
    subject_name = input("Enter subject name: ").strip() or "General"
    summary = recognize_faces(subject_name)
    if summary:
        print(f"\n--- Session Summary: {summary['subject']} ({summary['date']}) ---")
        print(f"Total: {summary['total']} | Present: {summary['present']} | Absent: {summary['absent']}")
