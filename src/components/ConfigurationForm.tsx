import { useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { MergeOptions, ThumbnailInput } from "@/types/audio-merge";

type LegacyThumb = { file?: File | null; url?: string };

type Props = {
  outputFileName: string;
  setOutputFileName: (v: string) => void;
  constantImageUrl: string;
  setConstantImageUrl: (v: string) => void;
  options: MergeOptions;
  setOptions: (opts: MergeOptions) => void;
  selectedFilesCount: number;

  // Controlled thumbnail (lifted to parent)
  thumbnail?: ThumbnailInput | LegacyThumb;
  setThumbnail: (t?: ThumbnailInput | LegacyThumb) => void;
};

export function ConfigurationForm({
  outputFileName,
  setOutputFileName,
  constantImageUrl,
  setConstantImageUrl,
  options,
  setOptions,
  selectedFilesCount,
  thumbnail,
  setThumbnail,
}: Props) {
  const previewUrl = useMemo(() => {
    if (thumbnail && "file" in thumbnail && thumbnail.file) {
      try {
        return URL.createObjectURL(thumbnail.file);
      } catch {
        return "";
      }
    }
    if (thumbnail && "url" in thumbnail && thumbnail.url) return thumbnail.url!;
    return constantImageUrl || "";
  }, [thumbnail, constantImageUrl]);

  useEffect(() => {
    return () => {
      if (thumbnail && "file" in thumbnail && thumbnail.file) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnail]);

  return (
    <div className="space-y-6">
      {/* Output file name */}
      <div className="space-y-2">
        <Label htmlFor="ofn">Output file name</Label>
        <Input
          id="ofn"
          placeholder="output"
          value={outputFileName}
          onChange={(e) => setOutputFileName(e.target.value)}
          className="focus-visible:ring-amber-500"
        />
        <p className="text-xs text-stone-600">
          This will be the base name; (.mp4 will be appended later).
        </p>
      </div>

      <Separator />

      {/* Thumbnail (optional) */}
      <div className="space-y-3">
        <Label>Thumbnail (optional)</Label>

        {previewUrl ? (
          <div className="relative w-full aspect-video rounded-md overflow-hidden border border-amber-200 bg-amber-50">
            <img
              src={previewUrl}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center border border-dashed rounded-md h-40 text-stone-500">
            <div className="text-sm">No image selected</div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.type.startsWith("image/")) {
                setThumbnail({ file, url: "" });
              } else {
                setThumbnail(undefined);
              }
            }}
          />
          {/* <Input
            placeholder="Or paste an image URL…"
            value={("url" in (thumbnail ?? {}) && (thumbnail as any).url) || ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v) setThumbnail({ file: null, url: v });
              else setThumbnail(undefined);
            }}
          /> */}
        </div>
      </div>

      <Separator />

      {/* Optional: constant fallback URL */}

      <div className="text-xs text-stone-700">
        {selectedFilesCount} file{selectedFilesCount !== 1 ? "s" : ""} selected.
      </div>
    </div>
  );
}
