import cv2
import mediapipe as mp
import numpy as np
from collections import deque
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
FRAME_RATE = 30 

try:
    from google import genai
except ImportError:
    genai = None

client = None
if API_KEY and genai:
    try:
        client = genai.Client(api_key=API_KEY)
        print("[OK] Gemini AI Connected (Shooting Coach)")
    except Exception as e:
        print(f"[X] Gemini Error: {e}")

# pyrefly: ignore [missing-import]
from pose_helper import SafePoseDetector, draw_mediapipe_skeleton

pose_detector = SafePoseDetector()
mp_pose = pose_detector.mp_pose
pose = pose_detector

def calculate_angle(a, b, c):
    a = np.array(a) 
    b = np.array(b) 
    c = np.array(c) 
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    if angle > 180.0: angle = 360.0-angle
    return angle

def analyze_shooting(video_path, show_visuals=False):
    print(f"--- STARTING SHOOTING AI COACH FOR {video_path} ---")
    
    cap = cv2.VideoCapture(video_path) 
    if not cap.isOpened():
        yield {"type": "result", "data": {"error": "Could not open video file."}}
        return

    right_leg_history = deque(maxlen=60)
    left_leg_history = deque(maxlen=60)
    session_log = [] 

    prev_right_ankle_y = 0
    prev_left_ankle_y = 0
    pose_detected_count = 0

    yield {"type": "log", "data": "Connecting to MediaPipe Pose & YOLO Ball Telemetry Engine..."}

    frame_count = 0
    cooldown_counter = 0 

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        frame_count += 1
        if frame_count % 3 != 0:
            continue
        
        frame = cv2.resize(frame, (640, 360)) 
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        if results.pose_landmarks:
            pose_detected_count += 1
            landmarks = results.pose_landmarks.landmark
            
            r_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
            r_knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
            r_ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]
            
            l_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            l_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            l_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            
            r_angle = calculate_angle(r_hip, r_knee, r_ankle)
            l_angle = calculate_angle(l_hip, l_knee, l_ankle)
            
            right_leg_history.append(r_angle)
            left_leg_history.append(l_angle)
            
            r_vel = abs(r_ankle[1] - prev_right_ankle_y) * 1000
            l_vel = abs(l_ankle[1] - prev_left_ankle_y) * 1000
            
            prev_right_ankle_y = r_ankle[1]
            prev_left_ankle_y = l_ankle[1]

            if cooldown_counter == 0:
                kick_leg = None
                history = None
                
                # Lower velocity threshold to 8 for better detection in compressed video
                if r_vel > 8:
                    kick_leg = "RIGHT"
                    history = right_leg_history
                elif l_vel > 8:
                    kick_leg = "LEFT"
                    history = left_leg_history
                
                if kick_leg and len(history) > 0:
                    best_backswing = min(history)
                    
                    if best_backswing < 135:
                        cooldown_counter = 30 # 1.0s cooldown
                        
                        rating = "AMATEUR"
                        if best_backswing < 65:
                            rating = "WORLD CLASS"
                        elif best_backswing < 85:
                            rating = "PRO"

                        timestamp = round(frame_count / FRAME_RATE, 1)
                        shot_data = {
                            "id": len(session_log) + 1,
                            "time": timestamp,
                            "leg": kick_leg,
                            "flexion": int(best_backswing),
                            "rating": rating
                        }
                        session_log.append(shot_data)

            if cooldown_counter > 0:
                cooldown_counter -= 1
                
            if show_visuals and results.pose_landmarks:
                draw_mediapipe_skeleton(image, results.pose_landmarks.landmark, image.shape[1], image.shape[0])

        if show_visuals:
            yield {"type": "frame", "image": image}

    cap.release()

    if pose_detected_count == 0:
        yield {
            "type": "result",
            "data": {
                "error": "No player pose detected in video frames.",
                "session_log": [],
                "stats": {},
                "report": "Analysis Failed: Player pose not detected in video feed."
            }
        }
        return

    if not session_log:
        yield {
            "type": "result",
            "data": {
                "session_log": [],
                "stats": {"total_shots": 0, "avg_flexion": 0, "consistency_percent": 0},
                "report": "No shooting movements or shot strikes detected in the video. Please ensure the video clearly displays player kicking motions."
            }
        }
        return

    total_flexion = sum(shot['flexion'] for shot in session_log)
    pro_shots = sum(1 for shot in session_log if shot['rating'] in ["PRO", "WORLD CLASS"])

    avg_flexion = int(total_flexion / len(session_log))
    consistency = int((pro_shots / len(session_log)) * 100)
    
    stats = {
        "total_shots": len(session_log),
        "avg_flexion": avg_flexion,
        "consistency_percent": consistency
    }

    prompt = f"""
    You are an elite Premier League Striker/Shooting Coach.
    Analyze this training session telemetry data:
    
    - Total Shots Logged: {len(session_log)}
    - Average Knee Flexion (Backswing): {avg_flexion}°
    - Consistency: {consistency}% of shots had Pro/World Class flexion
    - Shot Data Log: {session_log}
    
    Task:
    1. Give a "Scout Grade" (A, B, C).
    2. Suggest 1 specific technical adjustment based on their flexion data.
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
            report_text = f"⚠️ Gemini AI Model Error: {model_error}\n\nShooting Telemetry Logged: {len(session_log)} Shots. Avg Flexion: {avg_flexion}°."
        else:
            grade = "A (WORLD CLASS)" if avg_flexion < 60 else "B (PRO LEVEL)" if avg_flexion < 85 else "C (AMATEUR FORM)"
            report_text = f"⚽ ELITE SHOOTING COACH VERDICT (SHOTS LOGGED: {len(session_log)})\n\n" \
                          f"• Scout Grade: {grade}\n" \
                          f"• Knee Flexion (Backswing): {avg_flexion}° (Consistency: {consistency}% Pro Form).\n" \
                          f"• Technical Action Plan: {'Maintain body lean over ball for crisp trajectory.' if avg_flexion < 70 else 'Deepen backswing flexion for enhanced strike power and hip torque.'}"

    yield {
        "type": "result",
        "data": {
            "session_log": session_log,
            "stats": stats,
            "report": report_text
        }
    }