import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { OrderedAudio } from "@/types/audio-merge";
import { Button } from "@/components/ui/button";

export interface SourceAudio {
  id: string;
  name: string;
  mimeType: string;
  downloadUrl?: string | null;
}

type Props = {
  files: SourceAudio[];
  onChange: (ordered: OrderedAudio[]) => void;
};

export default function AudioPicker({ files, onChange }: Props) {
  const [orderMap, setOrderMap] = useState<Map<string, number>>(new Map());

  const ordered = useMemo<OrderedAudio[]>(() => {
    return [...orderMap.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([id, order]) => {
        const f = files.find((x) => x.id === id)!;
        return {
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          order,
          downloadUrl: f.downloadUrl ?? null,
        };
      });
  }, [orderMap, files]);

  // notify parent only when 'ordered' changes
  useEffect(() => {
    if (typeof onChange === "function") onChange(ordered);
  }, [ordered, onChange]);

  function select(id: string) {
    if (orderMap.has(id)) return;
    const next = new Map(orderMap);
    next.set(id, next.size + 1);
    setOrderMap(next);
  }

  function remove(id: string) {
    if (!orderMap.has(id)) return;
    const kept = [...orderMap.entries()]
      .filter(([k]) => k !== id)
      .sort((a, b) => a[1] - b[1]);
    const compact = new Map<string, number>();
    kept.forEach(([k], i) => compact.set(k, i + 1));
    setOrderMap(compact);
  }

  function reset() {
    setOrderMap(new Map());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">Select audios</h3>
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          className="rounded-xl"
        >
          Reset
        </Button>
      </div>

      {/* Selected dock (shows order and allows remove) */}
      {ordered.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
          {ordered.map((o) => (
            <div
              key={o.id}
              className="relative flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-2 py-1 text-sm"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-semibold">
                {o.order}
              </span>
              <span className="max-w-[14rem] truncate">{o.name}</span>
              <button
                type="button"
                aria-label={`Remove ${o.name}`}
                onClick={() => remove(o.id)}
                className="ml-1 grid h-6 w-6 place-items-center rounded-md border text-stone-700 hover:bg-amber-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {files.map((f) => {
          const ord = orderMap.get(f.id);
          const isSelected = ord !== undefined;
          return (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => select(f.id)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && select(f.id)
              }
              className={[
                "relative text-left p-3 rounded-2xl border transition focus:outline-none",
                "hover:bg-amber-50/60",
                isSelected
                  ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50"
                  : "border-stone-200",
              ].join(" ")}
            >
              <div className="text-sm font-medium truncate text-stone-900">
                {f.name}
              </div>
              <div className="text-xs text-stone-500">{f.mimeType}</div>

              {isSelected && (
                <span className="absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white text-sm">
                  {ord}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {ordered.length > 1 && (
        <div className="text-xs text-stone-600">
          Final order: {ordered.map((o) => `${o.order}:${o.name}`).join(" → ")}
        </div>
      )}
    </div>
  );
}
