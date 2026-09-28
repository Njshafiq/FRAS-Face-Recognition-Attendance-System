import os
import cv2
from database import get_connection

DATASET_FOLDER = "dataset"
LOCAL_CASCADE_PATH = "haarcascade/haarcascade_frontalface_default.xml"
NUMBER_OF_IMAGES = 20
FACE_SIZE = (200, 200)


def get_cascade_path():
    if os.path.exists(LOCAL_CASCADE_PATH):
        return LOCAL_CASCADE_PATH
    return cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


def student_exists(student_id):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM Students WHERE student_id = ?", (student_id,))
    result = cursor.fetchone()
    connection.close()
    return result is not None


def capture_faces(student_id, name):
    if not student_exists(student_id):
        print(f"Error: Student ID '{student_id}' is not registered. Please register first.")
        return

    student_folder = os.path.join(DATASET_FOLDER, f"{student_id}_{name}")
    os.makedirs(student_folder, exist_ok=True)

    cascade_path = get_cascade_path()
    face_detector = cv2.CascadeClassifier(cascade_path)
    if face_detector.empty():
        print(f"Error: Could not load face detector from {cascade_path}")
        return

    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        print("Error: Could not access the webcam.")
        return

    print("Look at the camera. Capturing images... Press 'q' to stop early.")
    image_count = 0

    while image_count < NUMBER_OF_IMAGES:
        success, frame = camera.read()
        if not success:
            print("Error: Failed to read frame from webcam.")
            break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5)

        for (x, y, w, h) in faces:
            image_count += 1
            face_crop = gray_frame[y:y + h, x:x + w]
            face_crop = cv2.resize(face_crop, FACE_SIZE)
            image_path = os.path.join(student_folder, f"{image_count}.jpg")
            cv2.imwrite(image_path, face_crop)

            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, f"Captured: {image_count}/{NUMBER_OF_IMAGES}",
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            break

        cv2.imshow("Capturing Faces - Press 'q' to quit", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        if image_count >= NUMBER_OF_IMAGES:
            break

    camera.release()
    cv2.destroyAllWindows()
    print(f"Captured {image_count} images for {name} (ID: {student_id}).")


if __name__ == "__main__":
    student_id = input("Enter Student ID: ").strip()
    name = input("Enter Student Name: ").strip()
    capture_faces(student_id, name)
