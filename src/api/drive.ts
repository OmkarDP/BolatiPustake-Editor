import type { DriveNode } from "@/lib/drive.types";

const endpoint = import.meta.env.VITE_N8N_DRIVE_ENDPOINT as string;

export async function fetchDriveTree(): Promise<DriveNode[]> {
  if (!endpoint) throw new Error("VITE_N8N_DRIVE_ENDPOINT is not set");
  const res = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "omit",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive fetch failed: ${res.status} ${text}`);
  }
  return res.json();
}
