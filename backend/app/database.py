import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "todo_db")

client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=3000)
database = client[DATABASE_NAME]
tasks_collection = database["tasks"]
