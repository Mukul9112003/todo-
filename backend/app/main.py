import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from dotenv import load_dotenv
from .app.database import client
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
