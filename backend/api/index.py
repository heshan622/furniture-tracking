from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS so your frontend can talk to it cleanly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "Backend is running live on Vercel!"}

# Paste your existing matching endpoints (like /api/audit-delivery) right below here!
# Just make sure you DO NOT include uvicorn.run() at the bottom. Delete that part entirely.