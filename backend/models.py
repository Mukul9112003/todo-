from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)
class TaskUpdate(BaseModel):
    completed: bool


class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    completed: bool
    created_at: datetime
def serialize_task(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "title": document["title"],
        "description": document.get("description", ""),
        "completed": document.get("completed", False),
        "created_at": document.get("created_at", datetime.now(timezone.utc)),
    }