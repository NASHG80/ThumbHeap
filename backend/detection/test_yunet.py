import argparse
import cv2
import json
import os
import numpy as np

# YuNet Default Hyperparameters
# -----------------------------
# SCORE_THRESHOLD: Minimum confidence score to consider a detection as a face.
# 0.6 is a reasonable default to balance precision and recall.
SCORE_THRESHOLD = 0.6

# NMS_THRESHOLD: Non-maximum suppression threshold to remove overlapping bounding boxes.
# 0.3 is standard to eliminate duplicates for the same face.
NMS_THRESHOLD = 0.3

# TOP_K: Maximum number of faces to keep before NMS.
TOP_K = 5000

def main():
    parser = argparse.ArgumentParser(description="Test YuNet Face Detection")
    parser.add_argument("image_path", help="Path to the sample image")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Image '{args.image_path}' not found.")
        return

    # Prepare paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, "models", "yunet", "face_detection_yunet_2023mar.onnx")
    outputs_dir = os.path.join(base_dir, "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    out_img_path = os.path.join(outputs_dir, "yunet_test_result.jpg")
    out_json_path = os.path.join(outputs_dir, "yunet_test_result.json")

    if not os.path.exists(model_path):
        print(f"Error: YuNet model not found at {model_path}")
        return

    print(f"Loading image '{args.image_path}'...")
    img = cv2.imread(args.image_path)
    if img is None:
        print(f"Error: Could not read image '{args.image_path}'")
        return

    h, w, _ = img.shape

    print(f"Initializing YuNet...")
    detector = cv2.FaceDetectorYN.create(
        model=model_path,
        config="",
        input_size=(w, h),
        score_threshold=SCORE_THRESHOLD,
        nms_threshold=NMS_THRESHOLD,
        top_k=TOP_K
    )

    print(f"Running detection...")
    # Inference
    status, faces = detector.detect(img)
    
    # faces is a 2D array of shape [num_faces, 15] or None
    # [x, y, w, h, x_re, y_re, x_le, y_le, x_nt, y_nt, x_rcm, y_rcm, x_lcm, y_lcm, score]

    output_data = []

    print(f"\n--- YuNet Results ---")
    if faces is not None:
        print(f"Faces detected: {faces.shape[0]}")
        for idx, face in enumerate(faces):
            box = list(map(int, face[0:4]))
            landmarks = list(map(int, face[4:14]))
            score = face[-1]
            
            # Format landmarks as list of (x,y)
            landmarks_pairs = [(landmarks[i], landmarks[i+1]) for i in range(0, 10, 2)]

            face_info = {
                "confidence": float(score),
                "box": {
                    "x": box[0],
                    "y": box[1],
                    "width": box[2],
                    "height": box[3]
                },
                "landmarks": [
                    {"type": "right_eye", "x": landmarks_pairs[0][0], "y": landmarks_pairs[0][1]},
                    {"type": "left_eye", "x": landmarks_pairs[1][0], "y": landmarks_pairs[1][1]},
                    {"type": "nose_tip", "x": landmarks_pairs[2][0], "y": landmarks_pairs[2][1]},
                    {"type": "right_mouth_corner", "x": landmarks_pairs[3][0], "y": landmarks_pairs[3][1]},
                    {"type": "left_mouth_corner", "x": landmarks_pairs[4][0], "y": landmarks_pairs[4][1]}
                ]
            }
            output_data.append(face_info)
            
            print(f"Face {idx + 1}:")
            print(f"  Confidence: {score:.4f}")
            print(f"  Bounding Box: (x={box[0]}, y={box[1]}, w={box[2]}, h={box[3]})")
            print(f"  Landmarks: {landmarks_pairs}")
            
            # Draw bounding box
            cv2.rectangle(img, (box[0], box[1]), (box[0] + box[2], box[1] + box[3]), (0, 255, 0), 2)
            
            # Draw landmarks
            for lm in landmarks_pairs:
                cv2.circle(img, lm, 2, (0, 0, 255), -1)
    else:
        print("Faces detected: 0")

    # Save visualization
    cv2.imwrite(out_img_path, img)
    print(f"\nVisualization saved to: {out_img_path}")

    # Save JSON
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=4)
    print(f"Raw results saved to: {out_json_path}")

if __name__ == "__main__":
    main()
