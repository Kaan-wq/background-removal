from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
import os

app = FastAPI(
    title="Background Removal API",
    description="Upload an image, get back a PNG with the background removed.",
    version="0.1.0",
)

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
