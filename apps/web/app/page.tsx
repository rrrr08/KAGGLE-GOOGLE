"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [run, setRun] = useState<any>(null);
  const AGENT = process.env.NEXT_PUBLIC_AGENT_URL || "";

  async function getStatus() {
    try {
      const r = await fetch(`${AGENT}/status`);
      setStatus(await r.json());
    } catch (e) {
      setStatus({ error: "Failed to fetch status" });
    }
  }

  async function triggerRun() {
    try {
      const r = await fetch(`${AGENT}/run_agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ who: "web", action: "smoke" }),
      });
      setRun(await r.json());
    } catch (e) {
      setRun({ error: "Failed to trigger run" });
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>TTA Agent UI (Turborepo)</h1>
      <div style={{ marginBottom: 20 }}>
        <p>Agent URL: {AGENT || "Not set (NEXT_PUBLIC_AGENT_URL)"}</p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={getStatus} style={{ marginRight: 10, padding: "8px 16px" }}>
          Get /status
        </button>
        <pre style={{ background: "#f0f0f0", padding: 10, borderRadius: 4, marginTop: 10 }}>
          {status ? JSON.stringify(status, null, 2) : "no status yet"}
        </pre>
      </div>
      <div>
        <button onClick={triggerRun} style={{ padding: "8px 16px" }}>
          POST /run_agent
        </button>
        <pre style={{ background: "#f0f0f0", padding: 10, borderRadius: 4, marginTop: 10 }}>
          {run ? JSON.stringify(run, null, 2) : "no run yet"}
        </pre>
      </div>
    </div>
  );
}
