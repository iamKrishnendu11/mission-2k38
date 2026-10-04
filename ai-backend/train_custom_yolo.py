"""
YOLOv8 Custom Model Training Script for Grassroots Football Analytics

This standalone script fine-tunes a base YOLOv8 model (yolov8n.pt) on a custom
single-class dataset specifically tuned for high-speed tracking and motion-blurred
footballs on grassroots / muddy pitches.

================================================================================
Dataset Directory Structure & data.yaml Format Guidelines:
================================================================================
Organize your dataset directory (e.g. ./football_dataset) as follows:

football_dataset/
├── data.yaml
├── train/
│   ├── images/
│   │   ├── frame_0001.jpg
│   │   ├── frame_0002.jpg
│   │   └── ...
│   └── labels/
│       ├── frame_0001.txt
│       ├── frame_0002.txt
│       └── ...
└── val/
    ├── images/
    │   ├── frame_0100.jpg
    │   └── ...
    └── labels/
        ├── frame_0100.txt
        └── ...

--------------------------------------------------------------------------------
Sample contents of data.yaml:
--------------------------------------------------------------------------------
path: ./football_dataset  # dataset root directory (absolute or relative)
train: train/images       # train images (relative to 'path')
val: val/images           # validation images (relative to 'path')

# Class Configuration for Single-Class Football Tracking
nc: 1                     # number of classes
names: ['football']       # class label list

--------------------------------------------------------------------------------
YOLO Annotation Format (*.txt per image):
-----------------------------------------
Each line represents one object bounding box normalized from 0.0 to 1.0:
<class-index> <x_center> <y_center> <width> <height>

Example for a single football:
0 0.4852 0.7214 0.0341 0.0452
================================================================================
"""

import os
import sys
import argparse
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()

def train_custom_yolo(
    data_config="data.yaml",
    epochs=50,
    imgsz=640,
    base_model="yolov8n.pt",
    project="runs/detect",
    name="football_custom"
):
    """
    Trains a custom YOLOv8 model for football detection.
    
    Args:
        data_config (str): Path to data.yaml dataset descriptor file.
        epochs (int): Number of training epochs (default: 50).
        imgsz (int): Target input image resolution (default: 640).
        base_model (str): Pretrained weights to start training from (default: 'yolov8n.pt').
        project (str): Directory where training output runs are saved.
        name (str): Experiment directory name within project.
    """
    print("=" * 68)
    print("       ULTRALYTICS YOLOV8 CUSTOM FOOTBALL MODEL TRAINING BUILDER")
    print("=" * 68)
    print(f" Base Model Weights:  {base_model}")
    print(f" Dataset Descriptor:  {data_config}")
    print(f" Training Epochs:     {epochs}")
    print(f" Image Resolution:    {imgsz}x{imgsz}")
    print(f" Output Location:     {project}/{name}")
    print("-" * 68)

    # Validate dataset config file existence
    if not os.path.exists(data_config):
        print(f"\n[!] Dataset descriptor file '{data_config}' was not found.")
        print("    Creating template 'data.yaml' in current directory...")
        
        template_yaml = """# Custom Single-Class Football Dataset Config
path: ./football_dataset  # dataset root directory
train: train/images       # train images (relative to 'path')
val: val/images           # val images (relative to 'path')

nc: 1
names: ['football']
"""
        with open("data.yaml", "w", encoding="utf-8") as f:
            f.write(template_yaml)
            
        print(" [✓] Template 'data.yaml' generated successfully!")
        print("\n====================================================================")
        print(" NEXT STEPS TO TRAIN YOUR MODEL:")
        print(" 1. Create directory structure: ./football_dataset/train/images and ./football_dataset/val/images")
        print(" 2. Add your training images (.jpg) and YOLO label files (.txt) inside labels folders")
        print(" 3. Re-run: python train_custom_yolo.py")
        print("====================================================================\n")
        return None

    # Step 1: Initialize base YOLOv8 model architecture
    print(f"\n[1/3] Initializing base YOLO model from '{base_model}'...")
    model = YOLO(base_model)

    # Step 2: Start custom training loop
    print(f"\n[2/3] Starting training for {epochs} epochs at imgsz={imgsz}...")
    results = model.train(
        data=data_config,
        epochs=epochs,
        imgsz=imgsz,
        project=project,
        name=name,
        exist_ok=True
    )

    # Step 3: Output path to best trained weights
    best_weights_path = os.path.abspath(os.path.join(project, name, "weights", "best.pt"))
    print("\n" + "=" * 68)
    print(" [✓] TRAINING COMPLETE!")
    print(f" [✓] Custom Weights Saved: {best_weights_path}")
    print("-" * 68)
    print(" To activate these weights in your sports analytics server:")
    print(" 1. Open your project .env file")
    print(f" 2. Add or update the line: CUSTOM_YOLO_WEIGHTS={best_weights_path}")
    print("=" * 68 + "\n")

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train a custom YOLOv8 model for high-speed football tracking."
    )
    parser.add_argument(
        "--data",
        type=str,
        default="data.yaml",
        help="Path to data.yaml dataset config file (default: data.yaml)"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=50,
        help="Number of training epochs (default: 50)"
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Input image resolution in pixels (default: 640)"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="yolov8n.pt",
        help="Base pretrained YOLO model (default: yolov8n.pt)"
    )
    parser.add_argument(
        "--project",
        type=str,
        default="runs/detect",
        help="Directory to save training run logs & weights (default: runs/detect)"
    )
    parser.add_argument(
        "--name",
        type=str,
        default="football_custom",
        help="Run experiment name (default: football_custom)"
    )

    args = parser.parse_args()

    train_custom_yolo(
        data_config=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        base_model=args.model,
        project=args.project,
        name=args.name
    )
