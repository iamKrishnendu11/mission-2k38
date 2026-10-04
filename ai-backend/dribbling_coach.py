import cv2
import mediapipe as mp
import numpy as np
import os
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
CONTROL_THRESHOLD_PX = 95          

try:
    from google import genai
except ImportError:
    genai = None

client = None
if API_KEY and genai:
    try:
        client = genai.Client(api_key=API_KEY)
        print("[OK] Gemini AI Connected (Dribbling)")
    except Exception as e:
        print(f"[X] Gemini Error: {e}")

def load_yolo_model():
    custom_weights = os.getenv("CUSTOM_YOLO_WEIGHTS")
    if custom_weights and os.path.exists(custom_weights):
        print(f"[✓] Loading custom-trained YOLO weights from: {custom_weights}")
        return YOLO(custom_weights)
    print("[!] Loading default 'yolov8n.pt'")
    return YOLO('yolov8n.pt')

print("Loading Models...")
yolo_model = load_yolo_model() 

from pose_helper import SafePoseDetector, draw_mediapipe_skeleton

pose_detector = SafePoseDetector()
mp_pose = pose_detector.mp_pose
pose = pose_detector

def analyze_dribbling(video_path, show_visuals=True):
    print(f"--- STARTING DRIBBLING AI COACH FOR {video_path} ---")
    
    control_frames = 0
    total_frames = 0
    touches = 0
    was_close = False 
    ball_path = []
    pose_detected_count = 0

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        yield {"type": "result", "data": {"error": "Could not open video file."}}
        return
        
    yield {"type": "log", "data": "Connecting to MediaPipe Pose & YOLO Ball Telemetry Engine..."}

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        total_frames += 1
        if total_frames % 3 != 0:
            continue

        frame = cv2.resize(frame, (640, 360))
        h, w, c = frame.shape
        
        yolo_results = yolo_model(frame, classes=[32], verbose=False, conf=0.15, imgsz=320)
        ball_pos = None
        
        for r in yolo_results:
            if len(r.boxes) > 0:
                box = r.boxes[0] 
                x1, y1, x2, y2 = box.xyxy[0]
                cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
                ball_pos = (cx, cy)
                
                cv2.circle(frame, ball_pos, 10, (0, 255, 255), -1)
                ball_path.append(ball_pos)
                if len(ball_path) > 30: ball_path.pop(0)
                for i in range(1, len(ball_path)):
                    cv2.line(frame, ball_path[i-1], ball_path[i], (0, 255, 255), 2)
                break 

        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pose_results = pose.process(img_rgb)
        
        closest_dist = 9999
        
        if pose_results.pose_landmarks and pose_results.pose_landmarks.landmark:
            pose_detected_count += 1
            landmarks = pose_results.pose_landmarks.landmark
            
            draw_mediapipe_skeleton(frame, landmarks, w, h)
                
            left_ankle = (int(landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x * w),
                          int(landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y * h))
            right_ankle = (int(landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x * w),
                           int(landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y * h))
            
            cv2.circle(frame, left_ankle, 5, (255, 0, 0), -1)
            cv2.circle(frame, right_ankle, 5, (255, 0, 0), -1)

            if ball_pos:
                dist_l = np.linalg.norm(np.array(left_ankle) - np.array(ball_pos))
                dist_r = np.linalg.norm(np.array(right_ankle) - np.array(ball_pos))
                closest_dist = min(dist_l, dist_r)
                
                if closest_dist < CONTROL_THRESHOLD_PX:
                    control_frames += 1
                    color = (0, 255, 0)
                    status = "CONTROL"
                    if not was_close:
                        touches += 1
                        was_close = True
                else:
                    color = (0, 0, 255)
                    status = "DRIFT"
                    was_close = False
                    
                cv2.line(frame, ball_pos, left_ankle if dist_l < dist_r else right_ankle, color, 2)
                cv2.putText(frame, f"{status} ({int(closest_dist)}px)", (ball_pos[0]+10, ball_pos[1]), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        yield {"type": "frame", "image": frame}

    cap.release()

    control_rating = round((control_frames * 100.0) / max(1, total_frames), 1)

    stats = {
        "touches": touches,
        "control_rating": int(control_rating)
    }

    prompt = f"""
    You are an elite Premier League Football/Soccer Coach.
    Analyze this player's dribbling session data:

    - Total Touches Logged: {touches}
    - Ball Control Rating: {int(control_rating)}/100 (percentage of time ball was kept closely under control)

    Task:
    1. Give a "Scout Grade" (A, B, C).
    2. Give 1 specific technical tip to improve ball keeping and tighter turns.
    3. Keep it short, motivating, and professional.
    """

    report_text = ""
    model_error = None
    if client:
        for m_name in ['gemini-3.6-flash', 'gemini-2.0-flash']:
            try:
                response = client.models.generate_content(
                    model=m_name,
                    contents=prompt
                )
                if response and response.text and response.text.strip():
                    report_text = response.text.strip()
                    break
            except Exception as e:
                model_error = f"[{m_name} Model Error]: {e}"
                print(f"[Warning] {model_error}")

    if not report_text:
        if model_error:
            report_text = f"⚠️ Gemini AI Model Error: {model_error}\n\nDribbling Telemetry Logged: {touches} Touches. Control Rating: {int(control_rating)}/100."
        else:
            grade = "A (WORLD CLASS)" if control_rating > 70 else "B (PRO LEVEL)" if control_rating > 40 else "C (DEVELOPING WINGER)"
            report_text = f"⚡ ELITE DRIBBLING COACH VERDICT (TOUCHES LOGGED: {touches})\n\n" \
                          f"• Scout Grade: {grade}\n" \
                          f"• Ball Control Rating: {int(control_rating)}/100.\n" \
                          f"• Technical Action Plan: Work on rapid inside/outside foot touches to keep ball within 50cm of stance."

    yield {
        "type": "result",
        "data": {
            "stats": stats,
            "report": report_text
        }
    }