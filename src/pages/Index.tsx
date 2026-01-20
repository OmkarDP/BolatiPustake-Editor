import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileAudio } from "lucide-react";
import { FolderTree } from "@/components/FolderTree";
import { FileList } from "@/components/FileList";
import { ConfigurationForm } from "@/components/ConfigurationForm";
import { PayloadPreview } from "@/components/PayloadPreview";
import { HistoryView } from "@/components/HistoryView";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import AudioPicker from "@/components/AudioPicker";
import PublishingControls from "@/components/PublishingControls";
import { toast } from "sonner";
import { getHistory, saveToHistory } from "@/utils/history";

import type {
  MergeOptions,
  HistoryItem,
  DriveFileRef,
  OrderedAudio,
  PublishingOptions,
  ExtendedMergePayload,
  ThumbnailInput,
} from "@/types/audio-merge";
import type { DriveNode } from "@/lib/drive.types";

// ---------------------------------------------
// Remote drive fetch
// ---------------------------------------------
const DRIVE_ENDPOINT = import.meta.env.VITE_N8N_DRIVE_ENDPOINT as string;

async function fetchDriveTree(): Promise<DriveNode[]> {
  if (!DRIVE_ENDPOINT) throw new Error("VITE_N8N_DRIVE_ENDPOINT not set");
  const res = await fetch(DRIVE_ENDPOINT, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Drive fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data?.roots ?? [];
}

function findById(roots: DriveNode[], id: string): DriveNode | null {
  for (const n of roots) {
    if (n.id === id) return n;
    const hit = n.children && findById(n.children, id);
    if (hit) return hit;
  }
  return null;
}

function buildPath(roots: DriveNode[], targetId: string): DriveNode[] {
  const path: DriveNode[] = [];
  const dfs = (nodes: DriveNode[]): boolean => {
    for (const node of nodes) {
      path.push(node);
      if (node.id === targetId) return true;
      if (node.children?.length && dfs(node.children)) return true;
      path.pop();
    }
    return false;
  };
  dfs(roots);
  return path;
}

// ---------------------------------------------
// Thumbnail helpers
// ---------------------------------------------
type LegacyThumb = { file?: File | null; url?: string };

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// If backend expects raw base64 (without "data:*/*;base64,"):
const toRawBase64 = (dataUrl: string) => dataUrl.split(",")[1] ?? dataUrl;

async function extractThumbnail(
  th: ThumbnailInput | LegacyThumb | undefined,
  fallbackUrl: string
): Promise<{
  thumbnailBase64: string | null;
  thumbnailMime: string | null;
  constantUrl: string | null;
}> {
  let thumbnailBase64: string | null = null;
  let thumbnailMime: string | null = null;
  let constantUrl: string | null = fallbackUrl || null;

  if (!th) return { thumbnailBase64, thumbnailMime, constantUrl };

  try {
    // Future-proof: discriminated union support
    if ("kind" in (th as any)) {
      const anyTh = th as any;
      if (anyTh.kind === "inline") {
        thumbnailBase64 = toRawBase64(anyTh.dataUrl);
        thumbnailMime = anyTh.mimeType || null;
      } else if (anyTh.kind === "url") {
        constantUrl = anyTh.url || null;
      }
      return { thumbnailBase64, thumbnailMime, constantUrl };
    }

    // Current/legacy shapes
    const maybeFile = (th as any).file as File | null | undefined;
    const maybeUrl = (th as any).url as string | undefined;

    if (maybeFile instanceof File) {
      const dataUrl = await fileToDataUrl(maybeFile);
      thumbnailBase64 = toRawBase64(dataUrl);
      thumbnailMime = maybeFile.type || null;
    } else if (maybeUrl && maybeUrl.trim()) {
      constantUrl = maybeUrl.trim();
    }
  } catch (e) {
    console.error("extractThumbnail failed:", e);
    toast.error("Could not read thumbnail file.");
  }

  return { thumbnailBase64, thumbnailMime, constantUrl };
}

// ---------------------------------------------
// Page
// ---------------------------------------------
const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<DriveNode | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const [outputFileName, setOutputFileName] = useState("");
  const [constantImageUrl, setConstantImageUrl] = useState("");

  const [options, setOptions] = useState<MergeOptions>({
    concatOrder: "filename",
    normalizeAudio: false,
    targetLoudnessLUFS: null,
    gapSeconds: 0,
    ffmpegArgs: null,
  });

  const [generatedPayload, setGeneratedPayload] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("builder");

  const [drive, setDrive] = useState<DriveNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Manual order + publishing
  const [orderedAudios, setOrderedAudios] = useState<OrderedAudio[]>([]);
  const [publishing, setPublishing] = useState<PublishingOptions>({
    channel: "Bolati Pustake",
    visibility: "private",
    scheduledTime: null,
  });

  // 🔒 Single source of truth for thumbnail (controlled by parent)
  const [thumbnail, setThumbnail] = useState<
    ThumbnailInput | LegacyThumb | undefined
  >(undefined);

  // History
  useEffect(() => setHistory(getHistory()), []);
  // Drive
  useEffect(() => {
    fetchDriveTree()
      .then((d) => {
        setDrive(d);
        setSelectedFolder(d.find((n) => n.kind === "folder") || null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const currentFiles = useMemo(
    () => selectedFolder?.children?.filter((c) => c.kind === "file") || [],
    [selectedFolder]
  );

  const currentAudioFiles = useMemo(
    () =>
      currentFiles
        .filter(
          (f) =>
            f.mimeType?.startsWith("audio/") ||
            /\.mp3$|\.m4a$|\.wav$/i.test(f.name)
        )
        .map((f) => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          downloadUrl: (f as any).downloadUrl ?? null,
        })),
    [currentFiles]
  );

  const breadcrumbs = useMemo(() => {
    if (!selectedFolder) return [];
    return buildPath(drive, selectedFolder.id).map((n) => ({
      id: n.id,
      name: n.name,
    }));
  }, [selectedFolder, drive]);

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ✅ Single generate that ALWAYS reads latest thumbnail from state
  const handleGenerate = async () => {
    const selectedFileObjects = currentFiles.filter((f) =>
      selectedFiles.has(f.id)
    );
    const driveFiles: DriveFileRef[] = selectedFileObjects.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
    }));

    const { thumbnailBase64, thumbnailMime, constantUrl } =
      await extractThumbnail(thumbnail, constantImageUrl);

    const payload: ExtendedMergePayload & {
      thumbnailBase64?: string | null;
      thumbnailMime?: string | null;
    } = {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user: { email: "admin@example.com" },
      constantImageUrl: constantUrl,
      outputFileName: outputFileName.trim(),
      driveFiles,
      options: {
        ...options,
        concatOrder: orderedAudios.length > 0 ? "manual" : options.concatOrder,
      },
      orderedAudios,
      publishing,
      thumbnailBase64,
      thumbnailMime,
    };

    setGeneratedPayload(payload);
  };

  const handleSaveToHistory = () => {
    if (!generatedPayload) return;
    const item: HistoryItem = {
      ...generatedPayload,
      status: "generated",
      fileCount: generatedPayload.driveFiles.length,
    };
    saveToHistory(item);
    setHistory(getHistory());
    toast.success("Saved to history");
    setGeneratedPayload(null);
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center bg-amber-50">
        <span className="text-amber-800">Loading Drive…</span>
      </div>
    );
  if (err)
    return (
      <div className="min-h-screen grid place-items-center bg-amber-50">
        <span className="text-red-700">{err}</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-amber-100 border-b border-amber-200 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <FileAudio className="text-amber-700 w-6 h-6" />
          <h1 className="font-semibold text-lg">Bolati Pustake Studio</h1>
        </div>
      </header>

      {/* Reserve space for fixed footer (72px + safe-area) */}
      <main className="px-3 py-4 space-y-4 pb-[calc(72px+env(safe-area-inset-bottom))]">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full flex gap-2 mb-3 bg-amber-100 rounded-lg p-1">
            <TabsTrigger
              value="builder"
              className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-amber-700 rounded-md"
            >
              Builder
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-amber-700 rounded-md"
            >
              History
            </TabsTrigger>
          </TabsList>

          {/* Builder */}
          <TabsContent value="builder">
            <div className="space-y-4">
              {/* Drive Browser */}
              <section className="bg-white border border-amber-200 rounded-xl shadow-sm p-4 space-y-3">
                <h2 className="font-semibold text-base">Drive Browser</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                  <Input
                    placeholder="Search folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-amber-300 focus:border-amber-500"
                  />
                </div>
                <FolderTree
                  items={drive}
                  onSelectFolder={(f) => {
                    setSelectedFolder(f);
                    setSelectedFiles(new Set());
                    setOrderedAudios([]);
                  }}
                  selectedFolderId={selectedFolder?.id || null}
                  searchQuery={searchQuery}
                />
              </section>

              {/* Folder Contents */}
              <section className="bg-white border border-amber-200 rounded-xl shadow-sm p-4 space-y-3">
                <h2 className="font-semibold text-base">Folder Contents</h2>
                <Breadcrumbs
                  items={breadcrumbs}
                  onNavigate={(id) => {
                    const folder = findById(drive, id);
                    if (folder?.kind === "folder") {
                      setSelectedFolder(folder);
                      setSelectedFiles(new Set());
                      setOrderedAudios([]);
                    }
                  }}
                />
                <FileList
                  files={currentFiles as any}
                  selectedFiles={selectedFiles}
                  onToggleFile={toggleFile}
                  onSelectAll={() =>
                    setSelectedFiles(new Set(currentFiles.map((f) => f.id)))
                  }
                  onClearSelection={() => setSelectedFiles(new Set())}
                />
                <AudioPicker
                  files={currentAudioFiles}
                  onChange={setOrderedAudios}
                />
              </section>

              {/* Config + Publish */}
              <section className="bg-white border border-amber-200 rounded-xl shadow-sm p-4 space-y-6">
                <ConfigurationForm
                  outputFileName={outputFileName}
                  setOutputFileName={setOutputFileName}
                  constantImageUrl={constantImageUrl}
                  setConstantImageUrl={setConstantImageUrl}
                  options={options}
                  setOptions={setOptions}
                  selectedFilesCount={selectedFiles.size}
                  // controlled thumbnail
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                />
                <PublishingControls
                  value={publishing}
                  onChange={setPublishing}
                />
              </section>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <div className="bg-white border border-amber-200 rounded-xl shadow-sm p-4">
              <HistoryView
                history={history}
                onRecreate={(item) => {
                  setOutputFileName(item.outputFileName);
                  setConstantImageUrl(item.constantImageUrl || "");
                  setOptions(item.options);
                  setSelectedFiles(new Set(item.driveFiles.map((f) => f.id)));
                  setActiveTab("builder");
                  toast.success("Restored from history");
                }}
                onRefresh={() => setHistory(getHistory())}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Fixed bottom action bar (72px tall) */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 h-[72px] border-t border-amber-300 bg-amber-100 px-4 py-3 flex gap-3 items-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          onClick={handleGenerate} // Only trigger
          disabled={selectedFiles.size === 0}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-stone-400"
        >
          Generate
        </button>
        <button
          onClick={handleSaveToHistory}
          disabled={!generatedPayload}
          className="flex-1 border border-amber-500 text-amber-800 bg-amber-50 hover:bg-amber-100 font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          Save
        </button>
      </div>

      <PayloadPreview
        payload={generatedPayload}
        onClose={() => setGeneratedPayload(null)}
        onSaveToHistory={handleSaveToHistory}
      />
    </div>
  );
};

export default Index;
