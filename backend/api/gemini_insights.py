"""
backend/api/gemini_insights.py
================================
Google Gemini Vision-based analytics generator.

Flow when user clicks "Generate AI Analysis":
  1. Load the original thumbnail from its Cloudinary URL (bytes)
  2. Load the heatmap overlay from its Cloudinary URL (bytes)
  3. Send BOTH images inline + structured prompt to Gemini
  4. Parse the JSON response into the AttentionBudget schema

The GEMINI_API_KEY is read from environment only — never returned to the frontend.
"""

import os
import json
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)
# Suppress noisy google_genai internal logs
logging.getLogger("google_genai.models").setLevel(logging.WARNING)


_gemini_model = None

FALLBACK_INSIGHTS = {
    "attention_score": 78,
    "attention_budget": [
        {"name": "Face",       "percentage": 41, "insight": "Large facial features and high contrast make this the dominant visual anchor."},
        {"name": "Title",      "percentage": 28, "insight": "The headline has strong visual weight because of its size and contrast."},
        {"name": "Subject",    "percentage": 19, "insight": "The central subject receives significant attention due to its scale and placement."},
        {"name": "Background", "percentage": 7,  "insight": "Background elements contribute moderate visual activity but relatively little semantic attention."},
        {"name": "Logo",       "percentage": 3,  "insight": "The logo remains visually recognizable but occupies limited attention."},
        {"name": "Other",      "percentage": 2,  "insight": "Subtle compositional elements direct attention without stealing focus."},
    ],
    "attention_efficiency": 82,
    "attention_leakage": 7,
    "primary_attention": "Face + Title",
    "strongest_anchor": "Face",
    "largest_competitor": "Title",
    "potential_distraction": "Background",
    "alignment": "High",
    "recommendations": [
        {"category": "Contrast",    "text": "Reduce background contrast slightly to redirect leaked attention toward the title."},
        {"category": "Composition", "text": "Consider increasing separation between the face and headline to avoid visual crowding."},
        {"category": "Hierarchy",   "text": "Your primary subject already receives strong predicted attention—no changes needed there."},
    ],
}


def _get_model():
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("[Gemini] GEMINI_API_KEY not set.")
        return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        _gemini_model = client
        logger.info("[Gemini] Client initialized with gemini-3.5-flash-lite")
        return _gemini_model
    except Exception as exc:
        logger.warning(f"[Gemini] Could not initialize model: {exc}")
        return None


def _fetch_image(url: str) -> Optional[bytes]:
    """Download an image from a URL and return raw bytes."""
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.content
    except Exception as exc:
        logger.warning(f"[Gemini] Could not fetch image from {url}: {exc}")
        return None


def generate_insights(
    detections: dict,
    original_url: Optional[str] = None,
    overlay_url: Optional[str] = None,
    stats: Optional[dict] = None,
) -> dict:
    """
    Generate full structured analytics using Gemini Vision.

    Sends the actual thumbnail image + heatmap overlay to the model so it can
    give thumbnail-specific answers instead of generic ones.

    Always returns a valid dict (fallback on any failure).
    """
    model = _get_model()
    if model is None:
        logger.warning("[Gemini] Model unavailable — returning fallback.")
        return FALLBACK_INSIGHTS

    texts   = int(detections.get("texts",   0))
    faces   = int(detections.get("faces",   0))
    objects = int(detections.get("objects", 0))

    attn_mean          = stats.get("mean",          0.0) if stats else 0.0
    attn_concentration = stats.get("concentration", 0.0) if stats else 0.0
    attn_peak          = stats.get("peak",          0.0) if stats else 0.0
    raw_score = min(100, round(attn_mean * 200))

    prompt = f"""You are an expert visual attention analyst for YouTube thumbnails.
I am providing you with TWO images:
  IMAGE 1 — the original YouTube thumbnail
  IMAGE 2 — the predicted attention heatmap overlay from an ML model (warm/red = high attention, cool/dark = low attention)

DETECTED ELEMENTS (from computer-vision pipeline):
  - Faces:   {faces}
  - Text elements: {texts}
  - Objects: {objects}

ATTENTION MAP STATISTICS:
  - Mean intensity:        {attn_mean:.3f}  (0=no attention, 1=maximum)
  - High-attention pixels: {attn_concentration:.3f} (fraction above 40% attention)
  - Peak attention:        {attn_peak:.3f}
  - Computed score:        {raw_score} / 100

TASK: Analyze BOTH images carefully and return a JSON object with EXACTLY this structure.
- All numeric fields must be integers.
- attention_budget percentages MUST sum to exactly 100.
- Name categories after SPECIFIC elements you can actually see in the thumbnail (e.g., "Person's Face", "Bold Yellow Text", "Gaming Controller", "Dark Background").
- Your insights and recommendations must reference what you LITERALLY see in the images.

{{
  "attention_score": {raw_score},
  "attention_budget": [
    {{"name": "Specific visible element", "percentage": N, "insight": "One sentence referencing what you see in the thumbnail/heatmap."}},
    ...
  ],
  "attention_efficiency": <integer 0-100>,
  "attention_leakage": <integer 0-100>,
  "primary_attention": "<what the heatmap shows is the #1 hotspot>",
  "strongest_anchor": "<the single element commanding most attention>",
  "largest_competitor": "<element competing with the primary anchor>",
  "potential_distraction": "<element drawing attention but is not primary>",
  "alignment": "<High | Medium | Low>",
  "recommendations": [
    {{"category": "Contrast",    "text": "Specific visual improvement based on what you see."}},
    {{"category": "Composition", "text": "Specific visual improvement based on what you see."}},
    {{"category": "Hierarchy",   "text": "Specific visual improvement based on what you see."}}
  ]
}}

Return ONLY the raw JSON — no markdown, no explanation."""

    # Build the parts list: text prompt + images
    from google.genai import types

    image_parts = []

    if original_url:
        img_bytes = _fetch_image(original_url)
        if img_bytes:
            # Detect mime type from URL
            mime = "image/png" if original_url.lower().endswith(".png") else "image/jpeg"
            image_parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime))
            logger.info(f"[Gemini] Attached original thumbnail ({len(img_bytes)} bytes)")

    if overlay_url:
        overlay_bytes = _fetch_image(overlay_url)
        if overlay_bytes:
            image_parts.append(types.Part.from_bytes(data=overlay_bytes, mime_type="image/png"))
            logger.info(f"[Gemini] Attached heatmap overlay ({len(overlay_bytes)} bytes)")

    contents = [prompt] + image_parts
    try:
        response = model.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=contents,
        )
        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

        parsed = json.loads(raw)

        # Validate required keys
        required = {
            "attention_score", "attention_budget", "attention_efficiency",
            "attention_leakage", "primary_attention", "strongest_anchor",
            "largest_competitor", "potential_distraction", "alignment",
            "recommendations",
        }
        missing = required - set(parsed.keys())
        if missing:
            raise ValueError(f"Response missing keys: {missing}")

        # Clamp score
        parsed["attention_score"] = max(0, min(100, int(parsed.get("attention_score", raw_score))))

        logger.info("[Gemini] Successfully generated insights.")
        return parsed

    except Exception as exc:
        logger.warning(f"[Gemini] Generation failed: {exc} — returning fallback.")
        return {**FALLBACK_INSIGHTS, "attention_score": raw_score}
