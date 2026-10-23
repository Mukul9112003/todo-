from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, status
from .database import tasks_collection
from .models import TaskCreate, TaskUpdate, serialize_task
router = APIRouter(prefix="/api/tasks", tags=["tasks"])
def parse_object_id(task_id: str) -> ObjectId:
    try:
        return ObjectId(task_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid task ID")


@router.get("")
async def list_tasks():
    tasks = []
    cursor = tasks_collection.find().sort("created_at", -1)
    async for document in cursor:
        tasks.append(serialize_task(document))
    return tasks


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")

    document = {
        "title": title,
        "description": payload.description.strip(),
        "completed": False,
        "created_at": datetime.now(timezone.utc),
    }
    result = await tasks_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return serialize_task(document)


@router.patch("/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate):
    oid = parse_object_id(task_id)
    result = await tasks_collection.update_one(
        {"_id": oid}, {"$set": {"completed": payload.completed}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    document = await tasks_collection.find_one({"_id": oid})
    return serialize_task(document)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    oid = parse_object_id(task_id)
    result = await tasks_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
