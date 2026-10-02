"""DairyFeed AI backend. Run with: uvicorn app.main:app --reload"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import advisory, devices, health, image, scoring, silage, stats

app = FastAPI(
    title="DairyFeed AI",
    description="Silage quality screening for dairy farmers (SIH 26111). A screening tool, not a lab test.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(silage.router)
app.include_router(image.router)
app.include_router(advisory.router)
app.include_router(stats.router)
app.include_router(devices.router)
app.include_router(scoring.router)
