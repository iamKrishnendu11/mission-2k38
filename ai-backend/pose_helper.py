import os
os.environ["GLOG_minloglevel"] = "3"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import cv2
import numpy as np
import ssl
import urllib.request

class Landmark:
    def __init__(self, x=0.0, y=0.0, z=0.0, visibility=0.0):
        self.x = x
        self.y = y
        self.z = z
        self.visibility = visibility

class PoseLandmarksContainer:
    def __init__(self, landmark_list=None):
        if landmark_list is None:
            landmark_list = [Landmark() for _ in range(33)]
        self.landmark = landmark_list

class PoseResultsContainer:
    def __init__(self, pose_landmarks=None):
        self.pose_landmarks = pose_landmarks

class PoseLandmarkEnumItem:
    def __init__(self, val):
        self.value = val

class PoseLandmarkEnumMeta:
    NOSE = PoseLandmarkEnumItem(0)
    LEFT_SHOULDER = PoseLandmarkEnumItem(11)
    RIGHT_SHOULDER = PoseLandmarkEnumItem(12)
    LEFT_ELBOW = PoseLandmarkEnumItem(13)
    RIGHT_ELBOW = PoseLandmarkEnumItem(14)
    LEFT_WRIST = PoseLandmarkEnumItem(15)
    RIGHT_WRIST = PoseLandmarkEnumItem(16)
    LEFT_HIP = PoseLandmarkEnumItem(23)
    RIGHT_HIP = PoseLandmarkEnumItem(24)
    LEFT_KNEE = PoseLandmarkEnumItem(25)
    RIGHT_KNEE = PoseLandmarkEnumItem(26)
    LEFT_ANKLE = PoseLandmarkEnumItem(27)
    RIGHT_ANKLE = PoseLandmarkEnumItem(28)
    POSE_CONNECTIONS = []

PoseLandmarkEnumMeta.PoseLandmark = PoseLandmarkEnumMeta

class SafePoseDetector:
    def __init__(self):
        self.pose_instance = None
        self.task_detector = None
        self.use_legacy = False
        self.use_tasks = False
        self.mp_pose = PoseLandmarkEnumMeta
        self.PoseLandmark = PoseLandmarkEnumMeta
        
        # 1. Try legacy mp.solutions.pose (Python 3.10 - 3.12)
        try:
            import mediapipe as mp
            if hasattr(mp, 'solutions') and hasattr(mp.solutions, 'pose'):
                self.mp_pose = mp.solutions.pose
                self.PoseLandmark = self.mp_pose.PoseLandmark
                self.pose_instance = self.mp_pose.Pose(
                    min_detection_confidence=0.2, 
                    min_tracking_confidence=0.2
                )
                self.use_legacy = True
                print("[SafePoseDetector] Using legacy mediapipe.solutions.pose (conf=0.2)")
        except Exception as e:
            print(f"[SafePoseDetector] Legacy pose initialization skipped: {e}")

        # 2. Try MediaPipe Tasks PoseLandmarker (Python 3.13+)
        if not self.use_legacy:
            try:
                import mediapipe as mp
                from mediapipe.tasks import python
                from mediapipe.tasks.python import vision

                backend_dir = os.path.dirname(os.path.abspath(__file__))
                model_path = os.path.join(backend_dir, 'pose_landmarker_lite.task')
                if not os.path.exists(model_path):
                    print("[SafePoseDetector] Downloading pose_landmarker_lite.task...")
                    url = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task'
                    ctx = ssl.create_default_context()
                    ctx.check_hostname = False
                    ctx.verify_mode = ssl.CERT_NONE
                    with urllib.request.urlopen(url, context=ctx) as response, open(model_path, 'wb') as out_file:
                        out_file.write(response.read())
                    print("[SafePoseDetector] Download complete!")

                base_options = python.BaseOptions(model_asset_path=model_path)
                options = vision.PoseLandmarkerOptions(
                    base_options=base_options,
                    running_mode=vision.RunningMode.IMAGE,
                    min_pose_detection_confidence=0.2,
                    min_pose_presence_confidence=0.2,
                    min_tracking_confidence=0.2,
                    num_poses=1
                )
                self.task_detector = vision.PoseLandmarker.create_from_options(options)
                self.use_tasks = True
                self.mp_module = mp
                print("[SafePoseDetector] Successfully initialized MediaPipe Tasks PoseLandmarker!")
            except Exception as e:
                print(f"[SafePoseDetector] MediaPipe Tasks initialization error: {e}")

    def process(self, image):
        if image is None:
            return PoseResultsContainer(None)

        # Ensure image is RGB format for MediaPipe
        if len(image.shape) == 3 and image.shape[2] == 3:
            img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            img_rgb = image

        if self.use_legacy and self.pose_instance:
            try:
                res = self.pose_instance.process(img_rgb)
                if res and res.pose_landmarks:
                    return res
            except Exception:
                pass

        if self.use_tasks and self.task_detector:
            try:
                mp_image = self.mp_module.Image(
                    image_format=self.mp_module.ImageFormat.SRGB, 
                    data=img_rgb
                )
                res = self.task_detector.detect(mp_image)
                if res and res.pose_landmarks and len(res.pose_landmarks) > 0:
                    first_person = res.pose_landmarks[0]
                    return PoseResultsContainer(PoseLandmarksContainer(first_person))
            except Exception as e:
                print(f"[SafePoseDetector] Tasks process error: {e}")

        return PoseResultsContainer(None)

POSE_CONNECTIONS = [
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16), # Shoulders & Arms
    (11, 23), (12, 24), (23, 24),                   # Torso & Hips
    (23, 25), (25, 27), (24, 26), (26, 28),         # Legs, Knees & Ankles
    (27, 29), (28, 30), (29, 31), (30, 32),         # Feet
    (0, 1), (1, 2), (2, 3), (3, 7), (0, 4), (4, 5), (5, 6), (6, 8) # Head & Face
]

def draw_mediapipe_skeleton(frame, landmarks, w, h):
    if not landmarks:
        return

    points = {}
    for idx, lm in enumerate(landmarks):
        px, py = int(lm.x * w), int(lm.y * h)
        points[idx] = (px, py)

    # 1. Draw Player Bounding Box (Solid Purple / Magenta matching Image 1 spec)
    x_coords = [pt[0] for pt in points.values()]
    y_coords = [pt[1] for pt in points.values()]
    if x_coords and y_coords:
        margin = 35
        x1, x2 = max(0, min(x_coords) - margin), min(w, max(x_coords) + margin)
        y1, y2 = max(0, min(y_coords) - margin), min(h, max(y_coords) + margin)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (240, 32, 160), 2, cv2.LINE_AA)

    # 2. Draw Skeleton Lines (Solid White)
    for p1_idx, p2_idx in POSE_CONNECTIONS:
        if p1_idx in points and p2_idx in points:
            pt1 = points[p1_idx]
            pt2 = points[p2_idx]
            cv2.line(frame, pt1, pt2, (255, 255, 255), 2, cv2.LINE_AA)

    # 3. Draw Key Joint Points (Solid Red dots with subtle white outline)
    for idx, pt in points.items():
        if idx in [0, 1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]:
            cv2.circle(frame, pt, 5, (0, 0, 255), -1, cv2.LINE_AA)
            cv2.circle(frame, pt, 5, (255, 255, 255), 1, cv2.LINE_AA)
