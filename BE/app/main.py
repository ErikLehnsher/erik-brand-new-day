from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.core.config import get_settings
from app.routes.auth import router as auth_router
from app.routes.posts import router as posts_router

settings = get_settings()
app = FastAPI(title="Erik Brand New Day")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(posts_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "service": "be"}


@app.get("/config")
def config():
    return {"api_host": settings.api_host, "api_port": settings.api_port}
