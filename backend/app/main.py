from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import analyze, chat, report, upload

app = FastAPI(
    title="HealthScan API",
    description="AI-powered medical report analysis for educational purposes",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(analyze.router, tags=["Analysis"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(report.router, tags=["Report"])


@app.get("/")
async def root():
    return {
        "name": "HealthScan API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
