// src/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const fetchExportedJob = async (jobId: string) => {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/export`);
  if (!res.ok) throw new Error("Failed to fetch job data");
  return res.json();
};