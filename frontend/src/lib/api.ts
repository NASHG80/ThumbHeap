/**
 * frontend/src/lib/api.ts
 * ========================
 * Thin API client for ThumbHeap backend.
 * API_BASE reads from VITE_API_BASE_URL env var; falls back to localhost:8000.
 *
 * SECURITY: GROQ_API_KEY is never passed here — it lives server-side only.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:8000';

export interface AnalysisDetections {
  texts: number;
  faces: number;
  objects: number;
}

export interface BudgetItem {
  name: string;
  percentage: number;
  insight: string;
}

export interface Recommendation {
  category: string;
  text: string;
}

export interface AnalysisInsights {
  attention_score: number;
  attention_budget: BudgetItem[];
  attention_efficiency: number;
  attention_leakage: number;
  primary_attention: string;
  strongest_anchor: string;
  largest_competitor: string;
  potential_distraction: string;
  alignment: string;
  recommendations: Recommendation[];
}

export interface AnalysisResult {
  id: string;
  url: string;
  overlay_url: string | null;
  detections: AnalysisDetections;
  insights: AnalysisInsights | null;
}

/**
 * POST /api/analyze
 * Sends the selected thumbnail to the ML pipeline.
 * Returns full analysis result including optional AI insights.
 */
export async function analyzeImage(file: File, token: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    // Do NOT manually set Content-Type — browser sets multipart boundary automatically
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('Your session has expired. Please log in again.');
  }
  if (res.status === 503) {
    throw new Error('Analysis pipeline is starting up. Please try again in a moment.');
  }
  if (res.status === 422) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'The image could not be processed. Please try a different file.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Analysis failed (${res.status}). Please try again.`);
  }

  return res.json() as Promise<AnalysisResult>;
}

/** GET /api/thumbnails — user's analysis history */
export async function getThumbnails(token: string) {
  const res = await fetch(`${API_BASE}/api/thumbnails`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Could not load history.');
  return res.json();
}
