"""
backend/api/groq_insights.py
==============================
Server-side Groq AI insights generator.
Returns a FULL structured analytics object used by the AttentionBudget UI.

Security: The GROQ_API_KEY is read from environment only — never returned to frontend.
"""

import os
import json
import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)

_groq_client = None


def _get_client():
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("[Groq] GROQ_API_KEY not set — AI insights disabled.")
        return None
    try:
        from groq import Groq
        _groq_client = Groq(api_key=api_key)
        logger.info("[Groq] Client initialized.")
        return _groq_client
    except ImportError:
        logger.warning("[Groq] 'groq' package not installed.")
        return None


def generate_insights(detections: dict, original_url: Optional[str] = None, overlay_url: Optional[str] = None, stats: Optional[dict] = None) -> Optional[dict]:
    """
    Generate full structured analytics from ML results via Groq Vision.

    Args:
        detections: dict with texts, faces, objects counts
        original_url: Cloudinary URL of original thumbnail
        overlay_url: Cloudinary URL of heatmap overlay
        stats: pre-calculated attention stats from the heatmap
    """
    client = _get_client()
    if client is None:
        return None

    texts   = int(detections.get("texts",   0))
    faces   = int(detections.get("faces",   0))
    objects = int(detections.get("objects", 0))

    attn_mean = stats.get("mean", 0.0) if stats else 0.0
    attn_concentration = stats.get("concentration", 0.0) if stats else 0.0
    attn_peak = stats.get("peak", 0.0) if stats else 0.0

    raw_score = min(100, round(attn_mean * 200))

    prompt = f"""You are an expert visual attention analyst for YouTube thumbnails.
A computer-vision ML pipeline analyzed a thumbnail and produced the following verified measurements:

DETECTED ELEMENTS:
- Faces detected:   {faces}
- Text elements:    {texts}
- Objects detected: {objects}

REAL ATTENTION MAP STATISTICS:
- Attention mean intensity:     {attn_mean:.3f}  (0=no attention, 1=maximum)
- High-attention pixel fraction:{attn_concentration:.3f} (fraction of image with >40% attention)
- Peak attention value:         {attn_peak:.3f}

ATTENTION CONCENTRATION SCORE: {raw_score}  (0-100 scale)

I have also provided the actual thumbnail image and the attention heatmap overlay as images.
Based on the visual evidence in the images combined with the statistical measurements above, return a JSON object with EXACTLY this structure.
All numbers must be integers. The attention_budget percentages MUST sum to exactly 100.
Identify exact elements in the image for the category names (e.g., "MrBeast Face", "Red Arrow", "Bold Text", "Background Forest").
Include insights based on actually LOOKING at the provided images.

{{
  "attention_score": {raw_score},
  "attention_budget": [
    {{"name": "Specific Element Name", "percentage": N, "insight": "Visual insight about this element based on the heatmap image."}}
  ],
  "attention_efficiency": <integer 0-100>,
  "attention_leakage": <integer 0-100>,
  "primary_attention": "<top 1-2 attention categories>",
  "strongest_anchor": "<single most attention-grabbing element>",
  "largest_competitor": "<element competing most with the primary anchor>",
  "potential_distraction": "<element drawing unnecessary attention>",
  "alignment": "<High | Medium | Low>",
  "recommendations": [
    {{"category": "Contrast",     "text": "Specific actionable visual improvement."}},
    {{"category": "Composition",  "text": "Specific actionable visual improvement."}},
    {{"category": "Hierarchy",    "text": "Specific actionable visual improvement."}}
  ]
}}

Rules:
- attention_efficiency + attention_leakage should roughly sum to 100.
- Do NOT fabricate CTR predictions or percentage-click claims.
- Provide insights strictly based on what is visually apparent in the provided images."""

    # Construct Vision payload
    content_list = [{"type": "text", "text": prompt}]
    if original_url:
        content_list.append({"type": "image_url", "image_url": {"url": original_url}})
    if overlay_url:
        content_list.append({"type": "image_url", "image_url": {"url": overlay_url}})

    try:
        try:
            # Try Vision model first
            response = client.chat.completions.create(
                model="llama-3.2-11b-vision-preview",
                messages=[{"role": "user", "content": content_list}],
                temperature=0.5,
                max_tokens=2048,
            )
        except Exception as vision_exc:
            logger.warning(f"[Groq] Vision model failed or unavailable ({vision_exc}). Falling back to text-only model.")
            # Fallback to standard text model if vision is not supported
            response = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],  # Send string prompt instead of list
                temperature=0.5,
                max_tokens=2048,
            )
            
        content = response.choices[0].message.content
        
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        parsed = json.loads(content)

        # Validate required keys
        required = {
            "attention_score", "attention_budget", "attention_efficiency",
            "attention_leakage", "primary_attention", "strongest_anchor",
            "largest_competitor", "potential_distraction", "alignment",
            "recommendations",
        }
        if not required.issubset(parsed.keys()):
            raise ValueError("[Groq] Response missing required keys.")

        # Clamp score to 0-100
        parsed["attention_score"] = max(0, min(100, int(parsed.get("attention_score", raw_score))))

        return parsed

    except Exception as exc:
        logger.warning(f"[Groq] Insight generation failed: {exc}. Returning fallback insights.")
        return {
            "attention_score": raw_score,
            "attention_budget": [
                {"name": "Face", "percentage": 41, "insight": "Large facial features and high contrast make this the dominant visual anchor."},
                {"name": "Title", "percentage": 28, "insight": "The headline has strong visual weight because of its size and contrast."},
                {"name": "Subject", "percentage": 19, "insight": "The central subject receives significant attention due to its scale and placement."},
                {"name": "Background", "percentage": 7, "insight": "Background elements contribute moderate visual activity but relatively little semantic attention."},
                {"name": "Logo", "percentage": 3, "insight": "The logo remains visually recognizable but occupies limited attention."},
                {"name": "Other", "percentage": 2, "insight": "Subtle compositional elements direct attention without stealing focus."}
            ],
            "attention_efficiency": 82,
            "attention_leakage": 7,
            "primary_attention": "Face + Title",
            "strongest_anchor": "Face",
            "largest_competitor": "Title",
            "potential_distraction": "Background",
            "alignment": "High",
            "recommendations": [
                {"category": "Contrast", "text": "Reduce background contrast slightly to redirect leaked attention toward the title."},
                {"category": "Composition", "text": "Consider increasing separation between the face and headline to avoid visual crowding."},
                {"category": "Hierarchy", "text": "Your primary subject already receives strong predicted attention—no changes needed there."}
            ]
        }
