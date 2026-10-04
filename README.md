# ⚽ Mission 2038 — AI-Powered Football Coaching & Scout Platform

> **Empowering Grassroots Talent with Premier League-Level Computer Vision & LLM Intelligence.**

---

## 📁 Clean 3-Tier Folder Structure

The project is structured into three clean top-level microservices:

```
Mission-2038/
├── 🌐 frontend/        # Next.js 16 Web Application & UI Components
├── ⚙️ backend/         # Node.js Express API Server & Socket.io Gateway
├── 🧠 ai-backend/      # Python FastAPI AI Engine (MediaPipe, YOLOv8, Gemini AI)
├── 🐳 docker-compose.yml
├── 📄 package.json     # Monorepo dev runner scripts
└── 📄 .env             # Global configuration & API keys
```

---

## 🎯 System Architecture & Services

### 1. `frontend/` (Next.js Application)
* Built with Next.js, React 19, Framer Motion, Three.js, Lucide Icons, and Tailwind CSS.
* Features real-time Server-Sent Events (SSE) video analysis playback and live player telemetry.
* **Port**: `3000`

### 2. `backend/` (Express API & Socket.io)
* Express REST API handling auth (JWT), database models (MongoDB Mongoose), social feeds, trials, and video uploads.
* Socket.io real-time chat and notification server.
* **Port**: `5000`

### 3. `ai-backend/` (FastAPI AI Engine)
* Computer Vision engine using MediaPipe Pose, YOLOv8 object detection, OpenCV, and Google Gemini AI.
* Custom coaches for Shooting Biomechanics (`ai_Coach.py`), Dribbling (`dribbling_coach.py`), and Goalkeeping (`goalkeeper_coach.py`).
* **Port**: `8000`

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js**: `v18.x` or higher
* **Python**: `v3.10` or `v3.11`
* **MongoDB**: Local instance or MongoDB Atlas URI
* **Google Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### Running All Services Concurrently

From the root directory:

```bash
# 1. Install root dependencies
npm install

# 2. Run all 3 services concurrently
npm run dev
```

This launches:
* `frontend` on http://localhost:3000
* `backend` on http://localhost:5000
* `ai-backend` on http://localhost:8000

---

### Running Individual Services

#### 🌐 Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev
```

#### ⚙️ Backend (`backend/`)
```bash
cd backend
npm install
npm run dev
```

#### 🧠 AI Backend (`ai-backend/`)
```bash
cd ai-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🐳 Docker Deployment

To spin up all services via Docker Compose:

```bash
docker-compose up --build
```

---

## 👥 Team & License

* **Team**: Algo Rhythm
* **License**: MIT
