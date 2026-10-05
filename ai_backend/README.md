# AI Ecosystem Backend

This repository contains the complete AI ecosystem for Mission 2038, including the computer vision tactical analysis pipeline, the individual player coaching modules, and custom YOLO training utilities. It is designed to run as an isolated Python microservice, consumed by the JavaScript frontend/backend.

## Folder Structure

*   **`api_service/`**: Contains the FastAPI server (`api.py`), the main YOLO tactical CV pipeline (`main.py`), and the LLM tactical analysis script (`tactical_llm.py`). This is the entry point for running the API and processing match footage.
*   **`coaching_modules/`**: Contains the individual player skill tracking and analysis scripts (`ai_Coach.py` for shooting, `dribbling_coach.py`, `goalkeeper_coach.py`). These provide real-time Server-Sent Events (SSE) streaming for individual skill breakdown.
*   **`training_utils/`**: Contains offline utilities for creating custom datasets and fine-tuning YOLO models (`create_custom_dataset.py`, `train_custom_yolo.py`). The frontend developer does not need to run these.

## ⚠️ Critical Warning for Developers

> **Model weights (`*.pt`) and the `.env` file are ignored by Git. You must get these files directly from the AI backend developer and place them in the correct directories before running the API.**
> 
> *   `yolo26n-pose.pt` should be placed in `coaching_modules/` (or the root `ai_backend/` directory depending on your setup).
> *   `.env` containing LLM keys should be placed in the root of `ai_backend/`.

## Setup Instructions

1.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
2.  **Install all dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the API

1. Navigate to `api_service/`.
2. Boot the API:
    ```bash
    cd api_service
    uvicorn api:app --reload --port 8080
    ```

*Note: Due to a 4GB VRAM constraint, running the full match `main.py` CV pipeline and the FastAPI server simultaneously is not recommended.*
