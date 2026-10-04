import os
os.environ["GLOG_minloglevel"] = "3"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import tempfile
import cv2
import base64
import json

from ai_Coach import analyze_shooting
from dribbling_coach import analyze_dribbling
from goalkeeper_coach import analyze_goalkeeper

app = FastAPI(title="Mission 2038 AI Coach Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to Mission 2038 AI Coach API"}

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
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                print(f"[Warning] Could not delete temp file {temp_path}: {e}")

from pydantic import BaseModel
import urllib.request

class VideoUrlRequest(BaseModel):
    video_url: str
    show_visuals: bool = True

def download_video_from_url(url: str) -> str:
    try:
        fd, temp_path = tempfile.mkstemp(suffix=".mp4")
        os.close(fd)
        urllib.request.urlretrieve(url, temp_path)
        return temp_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not download video from URL: {e}")

@app.post("/analyze/shooting")
async def process_shooting(file: UploadFile = File(...), show_visuals: bool = Form(True)):
    temp_path = save_upload_file_tmp(file)
    gen = analyze_shooting(temp_path, show_visuals=show_visuals)
    return StreamingResponse(sse_generator(gen, temp_path), media_type="text/event-stream")

@app.post("/analyze/dribbling")
async def process_dribbling(file: UploadFile = File(...), show_visuals: bool = Form(True)):
    temp_path = save_upload_file_tmp(file)
    gen = analyze_dribbling(temp_path, show_visuals=show_visuals)
    return StreamingResponse(sse_generator(gen, temp_path), media_type="text/event-stream")

@app.post("/analyze/goalkeeper")
async def process_goalkeeper(file: UploadFile = File(...), show_visuals: bool = Form(True)):
    temp_path = save_upload_file_tmp(file)
    gen = analyze_goalkeeper(temp_path, show_visuals=show_visuals)
    return StreamingResponse(sse_generator(gen, temp_path), media_type="text/event-stream")

@app.post("/analyze_url/{drill_type}")
async def process_video_url(drill_type: str, req: VideoUrlRequest):
    temp_path = download_video_from_url(req.video_url)
    if drill_type == "goalkeeper":
        gen = analyze_goalkeeper(temp_path, show_visuals=req.show_visuals)
    elif drill_type == "dribbling":
        gen = analyze_dribbling(temp_path, show_visuals=req.show_visuals)
    else:
        gen = analyze_shooting(temp_path, show_visuals=req.show_visuals)
    return StreamingResponse(sse_generator(gen, temp_path), media_type="text/event-stream")
