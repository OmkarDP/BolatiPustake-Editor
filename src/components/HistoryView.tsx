import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, RotateCcw, Trash2 } from "lucide-react";
import type { HistoryItem } from "@/types/audio-merge";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import { clearHistory } from "@/utils/history";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type HistoryViewProps = {
  history: HistoryItem[];
  onRecreate: (item: HistoryItem) => void;
  onRefresh: () => void;
};

export const HistoryView = ({
  history,
  onRecreate,
  onRefresh,
}: HistoryViewProps) => {
  const handleCopy = (item: HistoryItem) => {
    const jsonString = JSON.stringify(item, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast.success("Payload copied to clipboard");
  };

  const handleDownload = (item: HistoryItem) => {
    const jsonString = JSON.stringify(item, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merge-request-${item.requestId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Payload downloaded");
  };

  const doClear = () => {
    clearHistory();
    onRefresh();
    toast.success("History cleared");
  };

  const pill = (status: HistoryItem["status"]) => {
    const map: Record<string, string> = {
      success: "bg-emerald-100 text-emerald-800",
      failed: "bg-rose-100 text-rose-800",
      queued: "bg-amber-100 text-amber-800",
      processing: "bg-amber-100 text-amber-800",
    };
    return map[status] ?? "bg-stone-100 text-stone-800";
  };

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-stone-500 mb-2">No jobs yet</p>
          <p className="text-sm text-stone-500">
            Generate your first payload to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">History ({history.length})</h2>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all history?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={doClear}>Clear</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <Card
            key={item.requestId}
            className="p-4 border-stone-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate mb-1">
                  {item.outputFileName}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
                  <span>{formatDate(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.fileCount} files</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${pill(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(item)}
                  title="Copy JSON"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(item)}
                  title="Download JSON"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRecreate(item)}
                  title="Recreate form"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
