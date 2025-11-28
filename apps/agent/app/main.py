from fastapi import FastAPI
from pydantic import BaseModel
import os, datetime

app = FastAPI()
VERSION = os.getenv("VERSION", "dev")
COMMIT_SHA = os.getenv("COMMIT_SHA", "none")
START_TIME = datetime.datetime.utcnow().isoformat() + "Z"

class RunPayload(BaseModel):
    who: str
    action: str

@app.get("/status")
def status():
    return {
        "service": "tta-agent",
        "version": VERSION,
        "commit_sha": COMMIT_SHA,
        "start_time": START_TIME,
        "ready": True
    }

@app.post("/run_agent")
def run_agent(payload: RunPayload):
    run_id = "run-" + datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    trace = {"run_id": run_id, "steps": ["agentA","agentB","agentC"], "payload": payload.dict()}
    return {"run_id": run_id, "status": "ok", "trace": trace, "timestamp": datetime.datetime.utcnow().isoformat()+"Z"}
