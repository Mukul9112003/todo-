from fastapi import APIRouter, HTTPException, status
router = APIRouter(prefix="/api/tasks", tags=["tasks"])