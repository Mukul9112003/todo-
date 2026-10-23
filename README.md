# Aminoid AI — To-Do List Assessment

A full-stack task management app built with React + Vite, FastAPI, and MongoDB.

## Features
- Add tasks
- View all tasks
- Mark tasks complete/incomplete
- Delete tasks
- Persistent MongoDB storage
- FastAPI validation and CORS configuration
- Docker Compose for MongoDB
- Health endpoint and API documentation

## Requirements
- Python 3.11+
- Node.js 20+
- Docker Desktop (recommended) or a local MongoDB server

## 1. Start MongoDB

From the project root:

```bash
docker compose up -d mongodb
```

MongoDB is available at `mongodb://localhost:27017`. The database is named `todo_db`.

## 2. Start the backend

Open a terminal:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

**Windows PowerShell**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux**
```bash
source .venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend API: http://127.0.0.1:8000  
Swagger docs: http://127.0.0.1:8000/docs  
Health check: http://127.0.0.1:8000/health

Optional environment variables:
- `MONGODB_URL` (default: `mongodb://localhost:27017`)
- `DATABASE_NAME` (default: `todo_db`)
- `FRONTEND_ORIGIN` (default: `http://localhost:5173`)

## 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/{task_id}` | Update task completion |
| DELETE | `/api/tasks/{task_id}` | Delete task |
| GET | `/health` | Health and database status |

Example create request:

```json
{
  "title": "Prepare assessment",
  "description": "Finish the To-Do app"
}
```

## MongoDB configuration

The `docker-compose.yml` file starts MongoDB with a named persistent volume (`mongodb_data`).
Tasks are stored in the `tasks` collection in the `todo_db` database. Each task contains:
- `_id`: MongoDB ObjectId
- `title`: required string
- `description`: optional string
- `completed`: boolean
- `created_at`: UTC timestamp

## Suggested manual test checklist

1. Open the frontend and verify existing tasks load.
2. Add a task with a title and optional description.
3. Confirm the task appears in the list.
4. Mark it complete, then mark it incomplete again.
5. Delete the task and confirm it disappears.
6. Open http://127.0.0.1:8000/docs and test the endpoints.
7. Verify persisted records in MongoDB:
   ```bash
   docker exec -it aminoid-todo-mongodb mongosh todo_db
   db.tasks.find().pretty()
   ```

## Push to GitHub

Create an empty repository on GitHub, then from this project directory:

```bash
git init
git add .
git commit -m "Build full-stack To-Do List assessment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aminoid-todo-assessment.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and use the repository URL GitHub provides. Do not commit secrets or `.env` files.

## Project structure

```text
aminoid-todo-assessment/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── routes.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── docker-compose.yml
└── README.md
```
