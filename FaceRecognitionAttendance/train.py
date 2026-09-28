import os
import pickle
import numpy as np
import cv2

DATASET_FOLDER = "dataset"
TRAINER_FOLDER = "trainer"
MODEL_PATH = os.path.join(TRAINER_FOLDER, "trainer.yml")
LABELS_PATH = os.path.join(TRAINER_FOLDER, "labels.pickle")


def train_model():
    os.makedirs(TRAINER_FOLDER, exist_ok=True)

    faces = []
    labels = []
    label_map = {}

    if not os.path.exists(DATASET_FOLDER) or len(os.listdir(DATASET_FOLDER)) == 0:
        print("Error: No data found in dataset folder. Please capture faces first.")
        return

    next_label = 0

    for student_folder in sorted(os.listdir(DATASET_FOLDER)):
        folder_path = os.path.join(DATASET_FOLDER, student_folder)
        if not os.path.isdir(folder_path):
            continue
        if "_" not in student_folder:
            print(f"Skipping folder with unexpected name: {student_folder}")
            continue

        student_id, name = student_folder.split("_", 1)
        print(f"Processing images for {name} (ID: {student_id})...")

        current_label = next_label
        label_map[current_label] = (student_id, name)
        next_label += 1

        images_added = 0
        for image_name in os.listdir(folder_path):
            image_path = os.path.join(folder_path, image_name)
            face_image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            if face_image is None:
                print(f"Warning: Could not read {image_path}, skipping.")
                continue
            faces.append(face_image)
            labels.append(current_label)
            images_added += 1

        if images_added == 0:
            print(f"Warning: No usable images for {name} (ID: {student_id}).")

    if len(faces) == 0:
        print("Error: No faces could be loaded. Training failed.")
        return

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(faces, np.array(labels))
    recognizer.save(MODEL_PATH)

    with open(LABELS_PATH, "wb") as file:
        pickle.dump(label_map, file)

    print(f"Training complete. {len(faces)} face images used for {len(label_map)} student(s).")
    print(f"Model saved to {MODEL_PATH}, labels saved to {LABELS_PATH}")


if __name__ == "__main__":
    train_model()
