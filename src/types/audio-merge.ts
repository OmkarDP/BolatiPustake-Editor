// ─── Merge configuration and metadata ────────────────────────────────
export type ConcatOrder =
  | "filename"
  | "manual"
  | "modifiedAsc"
  | "modifiedDesc";

export interface MergeOptions {
  concatOrder: ConcatOrder;
  normalizeAudio: boolean;
  targetLoudnessLUFS: number | null;
  gapSeconds: number;
  ffmpegArgs: string | null;
}

// ─── Drive File Reference ────────────────────────────────────────────
export interface DriveFileRef {
  id: string;
  name: string;
  mimeType: string;
}

/**
 * Optional metadata that may or may not be present depending on the source.
 * Useful for UI lists (mobile-first rendering hides columns if these are absent).
 */
export interface FileMeta {
  size?: number; // bytes
  duration?: number; // seconds
  modifiedTime?: string; // ISO 8601
}

// Convenience type when you *do* have meta:
export type DriveFileWithMeta = DriveFileRef & FileMeta;

// ─── Thumbnail input (canonical) ─────────────────────────────────────
export type ThumbnailInput =
  | { kind: "url"; url: string }
  | { kind: "inline"; name: string; mimeType: string; dataUrl: string };

/**
 * Back-compat with older pickers that produced { file?: File; url?: string }.
 * You can accept this in component props but normalize to ThumbnailInput at the boundary.
 */
export type LegacyThumbnailInput = { file?: File; url?: string };

// ─── Merge Payload (shared, stable) ──────────────────────────────────
export interface MergePayload {
  requestId: string;
  timestamp: string;
  user: {
    email: string;
  };
  constantImageUrl: string | null; // fallback image when no thumbnail provided
  outputFileName: string; // must end with .mp4 for YouTube-friendly output
  driveFiles: DriveFileRef[]; // order-independent reference list
  options: MergeOptions;

  /**
   * Canonical thumbnail object. Keep optional for back-compat; many codepaths
   * will set this only when the client provides a URL or inline image.
   */
  thumbnail?: ThumbnailInput | null;
}

// ─── History item ────────────────────────────────────────────────────
export interface HistoryItem extends MergePayload {
  status: "generated";
  fileCount: number;
}

// ─── Additional types for YouTube automation ─────────────────────────
export type ChannelKey = "Bolati Pustake" | "SahityaRatna" | "Katharas";
export type Visibility = "private" | "unlisted" | "public" | "schedule";

export interface OrderedAudio {
  id: string; // from DriveFileRef.id
  name: string;
  mimeType: string;
  order: number; // manual order (1..N)
  downloadUrl?: string | null;
}

export interface PublishingOptions {
  channel: ChannelKey;
  visibility: Visibility;
  scheduledTime?: string | null; // ISO when visibility === "schedule"
}

// ─── Extended merge payload for FE/BE communication ──────────────────
export interface ExtendedMergePayload extends MergePayload {
  /**
   * Manual order captured by the UI (AudioPicker). If provided, the effective
   * concat order is "manual" (the client can also switch options.concatOrder).
   */
  orderedAudios: OrderedAudio[];

  /** Publishing controls to pass through to the backend service. */
  publishing: PublishingOptions;

  /**
   * Optional base64 when client sent an inline image and the backend expects
   * an immediate inlined payload (e.g., no multipart/form-data roundtrip).
   * If you only send ThumbnailInput, you can omit this.
   */
  thumbnailBase64?: string | null;
}
