from fastapi import FastAPI
app=FastAPI()
@app.get("/")
async def root():
    return {"message": "To-Do API", "docs": "/docs"}