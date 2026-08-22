"""
auth/router.py
--------------
FastAPI router for authentication.

Endpoints:
  POST  /api/auth/register  — email/password sign-up
  POST  /api/auth/login     — email/password sign-in
  POST  /api/auth/google    — Google ID-token sign-in / sign-up
  POST  /api/auth/logout    — invalidate session token
  GET   /api/auth/me        — return current user (requires Bearer token)
"""

import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
import bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from auth.db import auth_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ------------------------------------------------------------------
# Password hashing
# ------------------------------------------------------------------


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ------------------------------------------------------------------
# Google Client ID (from env)
# ------------------------------------------------------------------

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


# ------------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token (JWT) from the frontend


class AuthResponse(BaseModel):
    token: str
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    picture: Optional[str]
    provider: str
    created_at: str
    target_role: Optional[str] = None
    skills: Optional[list] = []

class UpdateProfileRequest(BaseModel):
    name: str
    target_role: Optional[str] = None
    skills: Optional[list] = None

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ------------------------------------------------------------------
# Auth dependency — extract user from Bearer token
# ------------------------------------------------------------------

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    session = auth_db.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    user = auth_db.get_user_by_id(session["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _safe_user(user: dict) -> dict:
    """Strip hashed_pw before sending to client."""
    return {k: v for k, v in user.items() if k != "hashed_pw"}


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------

@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    existing = auth_db.get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    hashed = hash_password(body.password)
    user = auth_db.create_user(
        email=body.email,
        name=body.name,
        hashed_pw=hashed,
        provider="email",
    )
    token = auth_db.create_session(user["id"])
    return AuthResponse(token=token, user=_safe_user(user))


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    user = auth_db.get_user_by_email(body.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("hashed_pw"):
        raise HTTPException(
            status_code=401,
            detail="This account uses Google Sign-In. Please use 'Continue with Google'.",
        )
    if not verify_password(body.password, user["hashed_pw"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth_db.create_session(user["id"])
    return AuthResponse(token=token, user=_safe_user(user))


@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest):
    """
    Accepts either:
    - A Google ID token (JWT) — verified via google-auth library
    - A Google access token — exchanged for user info via Google's userinfo API
    The frontend sends the access_token from useGoogleLogin hook.
    """
    import httpx

    google_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

    # Try as access_token first (from useGoogleLogin hook)
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {body.credential}"},
                timeout=10,
            )
            if resp.status_code == 200:
                info = resp.json()
                google_id = info.get("sub")
                email = info.get("email", "")
                name = info.get("name")
                picture = info.get("picture")
    except Exception:
        pass

    # Fallback: try as ID token
    if not google_id and GOOGLE_CLIENT_ID:
        try:
            idinfo = id_token.verify_oauth2_token(
                body.credential,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )
            google_id = idinfo["sub"]
            email = idinfo.get("email", "")
            name = idinfo.get("name")
            picture = idinfo.get("picture")
        except ValueError as exc:
            raise HTTPException(status_code=401, detail=f"Invalid Google credential: {exc}")

    if not google_id or not email:
        raise HTTPException(status_code=401, detail="Could not retrieve Google account info")

    user = auth_db.upsert_google_user(
        google_id=google_id,
        email=email,
        name=name,
        picture=picture,
    )
    token = auth_db.create_session(user["id"])
    return AuthResponse(token=token, user=_safe_user(user))


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        auth_db.delete_session(token)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def me(user: dict = Depends(get_current_user)):
    return UserResponse(**_safe_user(user))

@router.put("/profile", response_model=UserResponse)
async def update_profile(body: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    updated_user = auth_db.update_user_profile(
        user["id"],
        body.name,
        target_role=body.target_role,
        skills=body.skills,
    )
    return UserResponse(**_safe_user(updated_user))

@router.put("/password")
async def update_password(body: UpdatePasswordRequest, user: dict = Depends(get_current_user)):
    if user["provider"] != "email":
        raise HTTPException(status_code=400, detail="Cannot change password for a Google-authenticated account")
    
    if not verify_password(body.current_password, user["hashed_pw"]):
        raise HTTPException(status_code=401, detail="Incorrect current password")
        
    if len(body.new_password) < 8:
        raise HTTPException(status_code=422, detail="New password must be at least 8 characters")
        
    hashed = hash_password(body.new_password)
    auth_db.update_user_password(user["id"], hashed)
    return {"message": "Password updated successfully"}
