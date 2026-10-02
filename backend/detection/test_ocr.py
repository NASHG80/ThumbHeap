import argparse
import json
import os
import cv2
import numpy as np
from paddleocr import PaddleOCR

def main():
    parser = argparse.ArgumentParser(description="Test PaddleOCR 3.0.0 API")
    parser.add_argument("image_path", help="Path to the sample image")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Image '{args.image_path}' not found.")
        return

    print(f"Initializing PaddleOCR 3.0.0...")
    # Initialize PaddleOCR
    # use_textline_orientation=True allows recognizing text rotated by 180 degrees
    ocr = PaddleOCR(use_textline_orientation=True, lang='en')

    print(f"Running OCR on '{args.image_path}'...")
    # Run OCR
    result = ocr.predict(args.image_path)

    # Prepare outputs dir
    outputs_dir = os.path.join(os.path.dirname(__file__), "..", "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    out_img_path = os.path.abspath(os.path.join(outputs_dir, "ocr_test_result.jpg"))
    out_json_path = os.path.abspath(os.path.join(outputs_dir, "ocr_test_result.json"))

    # The result is a list of results for each image.
    if result is None or len(result) == 0:
        res = {}
    else:
        res = result[0]
        if res is None:
            res = {}
    
    output_data = []

    # Read image to draw bounding boxes
    img = cv2.imread(args.image_path)
    if img is None:
        print(f"Error: Could not read image with cv2: {args.image_path}")
        return

    print(f"\n--- OCR Results ---")
    texts = res.get('rec_texts', [])
    scores = res.get('rec_scores', [])
    # use rec_polys if available, else dt_polys
    boxes = res.get('rec_polys', res.get('dt_polys', []))

    for i in range(len(texts)):
        text = texts[i]
        score = float(scores[i]) if hasattr(scores[i], '__float__') else scores[i]
        box_arr = boxes[i]
        box = box_arr.tolist() if hasattr(box_arr, 'tolist') else box_arr
        
        output_data.append({
            "box": box,
            "text": text,
            "score": score
        })
        
        print(f"Detected Text: '{text}' | Confidence Score: {score:.4f}")
        print(f"Bounding Box: {box}")
        
        # Draw bounding box on image
        box_pts = np.array(box).astype(np.int32).reshape((-1, 1, 2))
        cv2.polylines(img, [box_pts], isClosed=True, color=(0, 255, 0), thickness=2)

    # Save output visualization
    cv2.imwrite(out_img_path, img)
    print(f"\nVisualization saved to: {out_img_path}")

    # Save output JSON
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=4, ensure_ascii=False)
    print(f"Raw results saved to: {out_json_path}")

if __name__ == "__main__":
    main()
