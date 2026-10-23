import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from dotenv import load_dotenv
from .database import client
from .routes import router
load_dotenv()
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    client.close()
app = FastAPI(
    title="Aminoid AI To-Do API",
    description="REST API for the Aminoid AI technical assessment.",
    version="1.0.0",
    lifespan=lifespan,
)
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
@app.get("/")
async def root():
    return {"message": "To-Do API", "docs": "/docs"}
@app.get("/health")
async def health():
    try:
        await client.admin.command("ping")
        return {"status": "ok", "database": "connected"}
    except PyMongoError:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected"},
        )
