import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, X, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import type { MergePayload, ExtendedMergePayload } from "@/types/audio-merge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

import { sendToN8N } from "@/api/generateVideo";

type PayloadPreviewProps = {
  payload: (MergePayload | ExtendedMergePayload) | null;
  onClose: () => void;
  onSaveToHistory: () => void;
};

export const PayloadPreview = ({
  payload,
  onClose,
  onSaveToHistory,
}: PayloadPreviewProps) => {
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  if (!payload) return null;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success("Payload copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merge-request-${payload.requestId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Payload downloaded");
  };

  const handleSave = () => {
    onSaveToHistory();
    toast.success("Saved to history");
  };
  const handleSendToN8N = async () => {
    try {
      setSending(true);
      const result = await sendToN8N(payload as any);

      if (result.kind === "video" && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          result.fileName || `${payload.outputFileName || "output"}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Video generated and downloaded");
      } else if (result.kind === "json") {
        const url = (result.json as any)?.url;
        if (url) {
          window.open(url, "_blank");
          toast.success("Video generated. Opened result URL.");
        } else {
          toast.success("Request sent. Check n8n for status.");
        }
      }

      onClose(); // close the JSON modal
      window.location.href = "/"; // 🔥 FULL PAGE RELOAD, NEW SESSION
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to send to n8n");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-pane border border-pane-border rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Generated Payload</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{jsonString}</code>
          </pre>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-4 border-t border-border">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy JSON
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
          >
            Save to History
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="ml-auto"
                onClick={handleSendToN8N}
                disabled={sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sending ? "Sending..." : "Send to n8n"}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs"
            >
              <p className="text-sm">
                Sends the payload to your n8n webhook. n8n will merge audio +
                thumbnail using FFmpeg and returns the video or a link.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
