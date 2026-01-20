import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { DriveNode } from "@/lib/drive.types";
import { cn } from "@/lib/utils";

/** Optional metadata you may attach when you have it */
export type FileMeta = {
  size?: number; // bytes
  duration?: number; // seconds
  modifiedTime?: string; // ISO
};

type FileListProps = {
  /** Pass in *files only* (filter folders out before or let this component do it) */
  files: (DriveNode & FileMeta)[];
  selectedFiles: Set<string>;
  onToggleFile: (fileId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
};

function formatBytes(n?: number) {
  if (!n && n !== 0) return "";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
}

function formatDuration(s?: number) {
  if (!s && s !== 0) return "";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

/** A tiny icon: pick from mimeType; fallback to a note */
function getFileIcon(mime?: string) {
  if (!mime) return "🎵";
  if (mime.includes("audio")) return "🎵";
  if (mime.includes("video")) return "🎬";
  return "📄";
}

export const FileList = ({
  files,
  selectedFiles,
  onToggleFile,
  onSelectAll,
  onClearSelection,
}: FileListProps) => {
  // keep only files; ignore folders just in case
  const fileRows = files.filter((f) => f.kind !== "folder");

  const allSelected =
    fileRows.length > 0 && fileRows.every((f) => selectedFiles.has(f.id));
  const someSelected = fileRows.some((f) => selectedFiles.has(f.id));

  // Detect if we actually have meta to show as columns
  const hasSize = fileRows.some((f) => typeof f.size === "number");
  const hasDur = fileRows.some((f) => typeof f.duration === "number");
  const hasMod = fileRows.some(
    (f) => typeof f.modifiedTime === "string" && f.modifiedTime
  );

  if (fileRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-stone-500">No audio files found in this folder</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-3"
      aria-label="Files"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() =>
              allSelected ? onClearSelection() : onSelectAll()
            }
            aria-label="Select all files"
          />
          <span className="text-sm text-stone-600">
            {selectedFiles.size > 0
              ? `${selectedFiles.size} selected`
              : "Select all"}
          </span>
        </div>
        {someSelected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            Clear selection
          </Button>
        )}
      </div>

      {/* Header (desktop only) */}
      <div className="hidden md:flex px-3 py-2 text-xs text-stone-500">
        <div className="w-6" />
        <div className="flex-1 pr-3">Name</div>
        {hasSize && <div className="w-28 text-right">Size</div>}
        {hasDur && <div className="w-24 text-right">Duration</div>}
        {hasMod && <div className="w-36 text-right">Modified</div>}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {fileRows.map((file) => {
          const isSelected = selectedFiles.has(file.id);
          const name = file.name || "(untitled)";

          return (
            <div
              key={file.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggleFile(file.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onToggleFile(file.id);
              }}
              className={cn(
                "w-full rounded-lg border transition outline-none",
                "hover:bg-amber-50/60 hover:border-amber-300",
                isSelected
                  ? "bg-amber-50 border-amber-400"
                  : "border-stone-200",
                "focus-visible:ring-2 focus-visible:ring-amber-500"
              )}
            >
              <div className="flex items-center gap-3 p-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleFile(file.id)}
                  aria-label={`Select ${name}`}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Name + icon (fills remaining width) */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0">
                    {getFileIcon(file.mimeType)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium truncate text-stone-900">
                      {name}
                    </div>

                    {/* Mobile meta (one line) */}
                    <div className="md:hidden flex items-center gap-3 text-xs text-stone-500">
                      {hasSize && file.size !== undefined && (
                        <span>{formatBytes(file.size)}</span>
                      )}
                      {hasDur && file.duration !== undefined && (
                        <span>{formatDuration(file.duration)}</span>
                      )}
                      {hasMod && file.modifiedTime && (
                        <span>{formatDate(file.modifiedTime)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop meta (right aligned) */}
                <div className="hidden md:flex items-center gap-6 text-sm text-stone-600 shrink-0">
                  {hasSize && (
                    <div className="w-28 text-right tabular-nums">
                      {file.size !== undefined ? formatBytes(file.size) : ""}
                    </div>
                  )}
                  {hasDur && (
                    <div className="w-24 text-right tabular-nums">
                      {file.duration !== undefined
                        ? formatDuration(file.duration)
                        : ""}
                    </div>
                  )}
                  {hasMod && (
                    <div className="w-36 text-right">
                      {file.modifiedTime ? formatDate(file.modifiedTime) : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
