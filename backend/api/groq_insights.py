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


def generate_insights(detections: dict, heatmap: Optional[np.ndarray] = None) -> Optional[dict]:
    """
    Generate full structured analytics from ML results via Groq.

    Args:
        detections: dict with texts, faces, objects counts
        heatmap:    numpy array (288,384) float32 [0,1] — the Fusion output

    Returns a dict with all fields needed by AttentionBudget, or None on failure.
    Failures MUST NOT break the ML analysis result.
    """
    client = _get_client()
    if client is None:
        return None

    texts   = int(detections.get("texts",   0))
    faces   = int(detections.get("faces",   0))
    objects = int(detections.get("objects", 0))

    # Derive real heatmap statistics when available
    attn_mean          = 0.0
    attn_concentration = 0.0
    attn_peak          = 0.0
    if heatmap is not None:
        try:
            attn_mean          = float(np.mean(heatmap))
            attn_concentration = float(np.mean(heatmap > 0.4))   # % pixels above 40% attention
            attn_peak          = float(np.max(heatmap))
        except Exception:
            pass

    # Derive a human-readable attention score (0-100)
    # heatmap values are 0-1; mean*200 capped to 100 gives a useful range
    raw_score = min(100, round(attn_mean * 200))

    prompt = f"""You are an expert visual attention analyst for YouTube thumbnails.
A computer-vision ML pipeline analyzed a thumbnail and produced the following verified measurements:

DETECTED ELEMENTS:
- Faces detected:   {faces}
- Text elements:    {texts}
- Objects detected: {objects}

REAL ATTENTION MAP STATISTICS (from the Fusion neural network output):
- Attention mean intensity:     {attn_mean:.3f}  (0=no attention, 1=maximum)
- High-attention pixel fraction:{attn_concentration:.3f} (fraction of image with >40% attention)
- Peak attention value:         {attn_peak:.3f}

ATTENTION CONCENTRATION SCORE (pre-computed): {raw_score}  (0-100 scale)

Based ONLY on these real measurements, return a JSON object with EXACTLY this structure.
All numbers must be integers. The attention_budget percentages MUST sum to exactly 100.
Derive category names from the detected elements (e.g., use "Face" only if faces>0, "Text" only if texts>0).
Always include at least "Background" as a catch-all category.

{{
  "attention_score": {raw_score},
  "attention_budget": [
    {{"name": "CategoryName", "percentage": N, "insight": "One-sentence insight about this element."}},
    {{"name": "CategoryName", "percentage": N, "insight": "One-sentence insight."}}
  ],
  "attention_efficiency": <integer 0-100: how well primary elements capture attention>,
  "attention_leakage": <integer 0-100: attention wasted on low-priority areas>,
  "primary_attention": "<top 1-2 attention categories>",
  "strongest_anchor": "<single most attention-grabbing element>",
  "largest_competitor": "<element competing most with the primary anchor>",
  "potential_distraction": "<element drawing unnecessary attention>",
  "alignment": "<High | Medium | Low>",
  "recommendations": [
    {{"category": "Contrast",     "text": "One specific actionable improvement."}},
    {{"category": "Composition",  "text": "One specific actionable improvement."}},
    {{"category": "Hierarchy",    "text": "One specific actionable improvement."}}
  ]
}}

Rules:
- attention_efficiency + attention_leakage should roughly sum to 100.
- Do NOT fabricate CTR predictions or percentage-click claims.
- Be specific and grounded in the actual detection numbers.
- Keep each insight/recommendation to one sentence."""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=2048,
        )
        content = response.choices[0].message.content
        
        # Clean potential markdown JSON block
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
            logger.warning("[Groq] Response missing required keys.")
            return None

        # Clamp score to 0-100
        parsed["attention_score"] = max(0, min(100, int(parsed["attention_score"])))

        return parsed

    except json.JSONDecodeError as exc:
        logger.warning(f"[Groq] JSON parse error: {exc}")
        return None
    except Exception as exc:
        logger.warning(f"[Groq] Insight generation failed: {exc}")
        return None
