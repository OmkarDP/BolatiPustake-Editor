import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X } from "lucide-react";

export type ThumbnailInput = {
  file: File | null;
  url: string;
};

type ThumbnailPickerProps = {
  value: ThumbnailInput;
  onChange: (value: ThumbnailInput) => void;
};

export const ThumbnailPicker = ({ value, onChange }: ThumbnailPickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value.file) {
      const objectUrl = URL.createObjectURL(value.file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(value.url || null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onChange({ file, url: "" });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ file: null, url: e.target.value });
  };

  const handleClear = () => {
    onChange({ file: null, url: "" });
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border border-amber-200 bg-amber-50">
          <img
            src={previewUrl}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleClear}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center border border-dashed rounded-md h-40 text-stone-500">
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            <p className="text-sm">No image selected</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="flex-1"
        >
          Upload Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div>
        <Input
          placeholder="Or paste an image URL..."
          value={value.url}
          onChange={handleUrlChange}
          className="focus-visible:ring-amber-500"
        />
      </div>
    </div>
  );
};
