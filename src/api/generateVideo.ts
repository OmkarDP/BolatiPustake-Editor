import type { MergePayload, ExtendedMergePayload } from "@/types/audio-merge";

export interface SendResult {
  kind: "video" | "json";
  fileName?: string;
  blob?: Blob;
  json?: unknown;
}

export async function sendToN8N(
  payload: MergePayload | ExtendedMergePayload
): Promise<SendResult> {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL;
  if (!url) throw new Error("VITE_N8N_WEBHOOK_URL not configured");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`n8n error ${res.status}: ${text || res.statusText}`);
  }

  const ct = res.headers.get("content-type") || "";

  if (ct.includes("video/")) {
    const blob = await res.blob();
    const disp = res.headers.get("content-disposition") || "";
    const match = /filename="?([^"]+)"?/.exec(disp);
    return { kind: "video", blob, fileName: match?.[1] };
  }

  const json = await res.json().catch(() => ({}));
  return { kind: "json", json };
}
