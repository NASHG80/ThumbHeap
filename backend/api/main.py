import os
import io
import logging
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
import jwt
import cloudinary
import cloudinary.uploader
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import api.inference_service as inference_service
from api.groq_insights import generate_insights

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models once at startup; release nothing (models live for process lifetime)."""
    try:
        inference_service.initialize()
        logger.info("ML models loaded successfully at startup.")
    except Exception as exc:
        logger.error(f"ML model initialisation failed: {exc}")
        # Server still starts; /api/analyze will return 503 if models are missing.
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = "HS256"

# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# DB
client = MongoClient(MONGO_URI)
db = client.thumbheap
users_col = db.users
thumbnails_col = db.thumbnails
profiles_col = db.creator_profiles

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class UserCreate(BaseModel):
    email: str
    password: str

def get_password_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return str(user["_id"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.post("/auth/register")
def register(user: UserCreate):
    if users_col.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = users_col.insert_one({
        "email": user.email,
        "password": get_password_hash(user.password),
        "created_at": datetime.datetime.utcnow()
    }).inserted_id
    
    return {"message": "User created", "user_id": str(user_id)}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_col.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """Original upload endpoint — stores raw thumbnail in Cloudinary + MongoDB unchanged."""
    try:
        # Upload the file to Cloudinary in the "Thumbheat" folder
        result = cloudinary.uploader.upload(file.file, folder="Thumbheat")
        secure_url = result.get("secure_url")
        
        doc_id = thumbnails_col.insert_one({
            "user_id": user_id,
            "cloudinary_url": secure_url,
            "filename": file.filename,
            "created_at": datetime.datetime.utcnow(),
            "ai_scores": {}
        }).inserted_id
        
        return {"id": str(doc_id), "url": secure_url}
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Upload failed.")


@app.post("/api/analyze")
async def analyze_thumbnail(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """
    ML inference endpoint.

    1. Uploads the original thumbnail to Cloudinary (reuses existing client).
    2. Runs the full 8-channel Fusion inference pipeline.
    3. Uploads the attention-heatmap overlay to Cloudinary.
    4. Stores all metadata in the existing thumbnails collection (reuses existing MongoDB connection).
    5. Returns URLs and detection counts to the frontend.
    """
    # Read file bytes once; UploadFile stream is single-use
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file received.")

    # ── Upload original thumbnail ────────────────────────────────────────────
    try:
        orig_result = cloudinary.uploader.upload(
            io.BytesIO(image_bytes), folder="Thumbheat"
        )
        original_url = orig_result.get("secure_url")
    except Exception as exc:
        logger.error(f"Cloudinary original upload failed: {exc}")
        raise HTTPException(status_code=502, detail="Image storage failed.")

    # ── Run ML inference ────────────────────────────────────────────────────
    try:
        result = inference_service.run_inference(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.error(f"Inference error: {exc}")
        raise HTTPException(status_code=503, detail="Inference pipeline unavailable.")
    except Exception as exc:
        logger.error(f"Unexpected inference error: {exc}")
        raise HTTPException(status_code=500, detail="Inference failed.")

    # ── Upload heatmap overlay ───────────────────────────────────────────────
    try:
        overlay_result = cloudinary.uploader.upload(
            io.BytesIO(result["overlay_png"]),
            folder="Thumbheat/overlays",
            format="png",
        )
        overlay_url = overlay_result.get("secure_url")
    except Exception as exc:
        logger.error(f"Cloudinary overlay upload failed: {exc}")
        overlay_url = None   # Non-fatal; numeric result is still valid

    # ── Persist metadata in existing thumbnails collection ──────────────────
    detections = result["detections"]
    try:
        doc_id = thumbnails_col.insert_one({
            "user_id":          user_id,
            "filename":         file.filename,
            "cloudinary_url":   original_url,
            "overlay_url":      overlay_url,
            "created_at":       datetime.datetime.utcnow(),
            "ai_scores": {
                "texts_detected":   detections["texts"],
                "faces_detected":   detections["faces"],
                "objects_detected": detections["objects"],
            },
        }).inserted_id
    except Exception as exc:
        logger.error(f"MongoDB insert failed: {exc}")
        raise HTTPException(status_code=500, detail="Result storage failed.")

    # ── Generate AI insights via Groq (non-blocking — failure does NOT fail request) ──
    insights = None
    try:
        insights = generate_insights(detections, heatmap=result.get("heatmap_array"))
    except Exception as exc:
        logger.warning(f"Groq insights skipped: {exc}")

    return {
        "id":          str(doc_id),
        "url":         original_url,
        "overlay_url": overlay_url,
        "detections":  detections,
        "insights":    insights,
    }

@app.get("/api/thumbnails")
def get_thumbnails(user_id: str = Depends(get_current_user)):
    docs = list(thumbnails_col.find({"user_id": user_id}).sort("created_at", -1))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return {"thumbnails": docs}


# ── Creator Profile ──────────────────────────────────────────────────────────

from typing import List, Optional

class CreatorProfile(BaseModel):
    # Channel identity
    channel_name: Optional[str] = None
    channel_url: Optional[str] = None

    # Content type
    video_category: Optional[str] = None          # e.g. "Education", "Gaming", "Vlog"
    video_types: Optional[List[str]] = []         # e.g. ["Tutorials", "Reviews", "Shorts"]
    niche_description: Optional[str] = None       # free-text niche

    # Audience
    target_age_groups: Optional[List[str]] = []   # e.g. ["13-17", "18-24", "25-34"]
    target_genders: Optional[List[str]] = []      # e.g. ["Male", "Female", "All"]
    audience_regions: Optional[List[str]] = []    # e.g. ["India", "USA", "Global"]

    # Channel stats & habits
    channel_size: Optional[str] = None            # e.g. "<1K", "1K-10K", "10K-100K", "100K+"
    upload_frequency: Optional[str] = None        # e.g. "Daily", "Weekly", "Bi-weekly"
    avg_video_length: Optional[str] = None        # e.g. "<5 min", "5-15 min", "15-30 min", "30+ min"

    # Goals
    primary_goal: Optional[str] = None            # e.g. "Grow subscribers", "Monetise", "Brand awareness"
    biggest_challenge: Optional[str] = None       # e.g. "Low CTR", "Watch time", "Thumbnail design"

    # Thumbnail style preferences
    thumbnail_style: Optional[List[str]] = []     # e.g. ["Face-forward", "Text-heavy", "Minimalist"]
    color_preference: Optional[str] = None        # e.g. "Bright", "Dark", "Neutral"


@app.get("/api/profile")
def get_profile(user_id: str = Depends(get_current_user)):
    """Return the creator profile for the authenticated user."""
    profile = profiles_col.find_one({"user_id": user_id})
    if not profile:
        return {"profile": None}
    profile["_id"] = str(profile["_id"])
    return {"profile": profile}


@app.put("/api/profile")
def upsert_profile(data: CreatorProfile, user_id: str = Depends(get_current_user)):
    """Create or update the creator profile for the authenticated user."""
    payload = data.dict()
    payload["user_id"] = user_id
    payload["updated_at"] = datetime.datetime.utcnow()

    profiles_col.update_one(
        {"user_id": user_id},
        {"$set": payload},
        upsert=True
    )
    return {"message": "Profile saved successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
