import os
import cv2
import numpy as np

def create_sample_dataset():
    base_dir = "football_dataset"
    train_img_dir = os.path.join(base_dir, "train", "images")
    train_lbl_dir = os.path.join(base_dir, "train", "labels")
    val_img_dir = os.path.join(base_dir, "val", "images")
    val_lbl_dir = os.path.join(base_dir, "val", "labels")

    os.makedirs(train_img_dir, exist_ok=True)
    os.makedirs(train_lbl_dir, exist_ok=True)
    os.makedirs(val_img_dir, exist_ok=True)
    os.makedirs(val_lbl_dir, exist_ok=True)

    # Generate synthetic pitch images with a synthetic football
    def generate_image_and_label(img_path, label_path):
        # 640x640 green grass pitch background
        img = np.zeros((640, 640, 3), dtype=np.uint8)
        img[:] = (34, 139, 34) # Green pitch color
        
        # Add white circle (football) at (320, 320) with radius 20
        center_x, center_y, radius = 320, 320, 20
        cv2.circle(img, (center_x, center_y), radius, (255, 255, 255), -1)
        cv2.imwrite(img_path, img)

        # YOLO format: class x_center y_center width height (normalized 0..1)
        # Class 0 = football
        norm_x = center_x / 640.0
        norm_y = center_y / 640.0
        norm_w = (radius * 2) / 640.0
        norm_h = (radius * 2) / 640.0

        with open(label_path, "w", encoding="utf-8") as f:
            f.write(f"0 {norm_x:.4f} {norm_y:.4f} {norm_w:.4f} {norm_h:.4f}\n")

    # Generate 4 training frames and 2 validation frames
    for i in range(1, 5):
        generate_image_and_label(
            os.path.join(train_img_dir, f"frame_{i:04d}.jpg"),
            os.path.join(train_lbl_dir, f"frame_{i:04d}.txt")
        )

    for i in range(1, 3):
        generate_image_and_label(
            os.path.join(val_img_dir, f"val_{i:04d}.jpg"),
            os.path.join(val_lbl_dir, f"val_{i:04d}.txt")
        )

    print("[✓] Football dataset directory structure and sample frames created successfully!")

if __name__ == "__main__":
    create_sample_dataset()
