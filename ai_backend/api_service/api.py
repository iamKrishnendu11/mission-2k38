import os
os.environ["GLOG_minloglevel"] = "3"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import tempfile
import cv2
import base64
import json

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from tactical_llm import generate_tactical_report
from coaching_modules.ai_Coach import analyze_shooting
from coaching_modules.dribbling_coach import analyze_dribbling
from coaching_modules.goalkeeper_coach import analyze_goalkeeper

app = FastAPI(title="Mission 2K38 AI Suite API")

# Add CORS so Next.js frontend can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Mission 2K38 AI Suite API is running."}

# --- Tactical CV & LLM Endpoints ---

@app.get("/api/v1/scouting-report")
def get_scouting_report():
    json_path = "tactical_stats.json"
    
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Tactical stats not found. Please process a video first.")
        
    report = generate_tactical_report(json_path)
    
    if report.startswith("Error"):
        raise HTTPException(status_code=500, detail=report)
        
    return {"scouting_report": report}

# --- Individual Coaching Endpoints ---

def save_upload_file_tmp(upload_file: UploadFile) -> str:
    try:
        suffix = os.path.splitext(upload_file.filename)[1]
        fd, temp_path = tempfile.mkstemp(suffix=suffix)
        with os.fdopen(fd, 'wb') as f:
            shutil.copyfileobj(upload_file.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        upload_file.file.close()
    return temp_path

def sse_generator(coach_generator, temp_path):
    try:
        for item in coach_generator:
            if item["type"] == "frame":
                # Encode frame to JPEG
                ret, buffer = cv2.imencode('.jpg', item["image"], [int(cv2.IMWRITE_JPEG_QUALITY), 60])
                if ret:
                    b64 = base64.b64encode(buffer).decode('utf-8')
                    payload = json.dumps({"type": "frame", "data": b64})
                    yield f"data: {payload}\n\n"
            elif item["type"] == "log":
                payload = json.dumps({"type": "log", "data": item["data"]})
                yield f"data: {payload}\n\n"
            elif item["type"] == "result":
                payload = json.dumps({"type": "result", "data": item["data"]})
                yield f"data: {payload}\n\n"
    except Exception as e:
        error_payload = json.dumps({"type": "log", "data": f"Error during processing: {str(e)}"})
        yield f"data: {error_payload}\n\n"
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                print(f"[Warning] Could not delete temp file {temp_path}: {e}")

@app.post("/analyze/shooting")
async def process_shooting(file: UploadFile = File(...), show_visuals: bool = Form(False)):
    temp_path = save_upload_file_tmp(file)
    gen = analyze_shooting(temp_path, show_visuals=show_visuals)
    return StreamingResponse(sse_generator(gen, temp_path), media_type="text/event-stream")

@app.post("/analyze/dribbling")
async def process_dribbling(file: UploadFile = File(...), show_visuals: bool = Form(False)):
    temp_path = save_upload_file_tmp(file)
    gen = analyze_dribbling(temp_path, show_visuals=show_visuals)
    return StreamingResponse(sse_generator(gen, temp_path), media_type="text/event-stream")

@app.post("/analyze/goalkeeper")
async def process_goalkeeper(file: UploadFile = File(...), show_visuals: bool = Form(False)):
    temp_path = save_upload_file_tmp(file)
    gen = analyze_goalkeeper(temp_path, show_visuals=show_visuals)
    return StreamingResponse(sse_generator(gen, temp_path), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=True)
