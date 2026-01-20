import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderOpen,
} from "lucide-react";
import type { DriveNode } from "@/lib/drive.types";
import { cn } from "@/lib/utils";

type FolderTreeProps = {
  items: DriveNode[];
  onSelectFolder: (folder: DriveNode) => void;
  selectedFolderId: string | null;
  searchQuery?: string;
};

type FolderNodeProps = {
  item: DriveNode;
  level: number;
  onSelectFolder: (folder: DriveNode) => void;
  selectedFolderId: string | null;
  searchQuery?: string;
};

const includesCI = (s: string, q: string) =>
  s.toLowerCase().includes(q.toLowerCase());

function matchesDeep(node: DriveNode, q: string): boolean {
  if (!q) return true;
  if (includesCI(node.name, q)) return true;
  if (!node.children?.length) return false;
  return node.children.some((c) => matchesDeep(c, q));
}

function hasFolderChildren(node: DriveNode): boolean {
  return Boolean(node.children?.some((c) => c.kind === "folder"));
}

const FolderNode = ({
  item,
  level,
  onSelectFolder,
  selectedFolderId,
  searchQuery,
}: FolderNodeProps) => {
  if (item.kind !== "folder") return null;

  const [expanded, setExpanded] = useState(level === 0);
  const subtreeMatches = searchQuery ? matchesDeep(item, searchQuery) : true;
  const forcedOpen = Boolean(searchQuery) && subtreeMatches;
  const isOpen = forcedOpen || expanded;

  if (searchQuery && !subtreeMatches) return null;

  const isSelected = selectedFolderId === item.id;
  const showChevron = hasFolderChildren(item);

  const toggleExpand = () => {
    if (showChevron && !forcedOpen) setExpanded((v) => !v);
  };

  return (
    <div
      role="treeitem"
      aria-expanded={isOpen}
      aria-selected={isSelected}
    >
      <button
        onClick={() => {
          toggleExpand();
          onSelectFolder(item);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            if (!isOpen) toggleExpand();
          }
          if (e.key === "ArrowLeft") {
            if (isOpen && !forcedOpen) setExpanded(false);
          }
        }}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition",
          "hover:bg-amber-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
          isSelected && "bg-amber-50 font-medium border border-amber-300"
        )}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        aria-label={`Folder ${item.name}${isOpen ? " expanded" : ""}`}
      >
        {showChevron ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-stone-500" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-stone-500" />
          )
        ) : (
          <span className="w-4" />
        )}

        {isOpen && isSelected ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-amber-600" />
        ) : (
          <FolderIcon className="h-4 w-4 shrink-0 text-stone-500" />
        )}

        <span className="truncate">{item.name}</span>
      </button>

      {isOpen && item.children && (
        <div role="group">
          {item.children.map((child) => (
            <FolderNode
              key={child.id}
              item={child}
              level={level + 1}
              onSelectFolder={onSelectFolder}
              selectedFolderId={selectedFolderId}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree = ({
  items,
  onSelectFolder,
  selectedFolderId,
  searchQuery,
}: FolderTreeProps) => {
  const foldersOnly = useMemo(
    () => items.filter((n) => n.kind === "folder"),
    [items]
  );

  return (
    <div
      className="space-y-1"
      role="tree"
      aria-label="Folders"
    >
      {foldersOnly.map((item) => (
        <FolderNode
          key={item.id}
          item={item}
          level={0}
          onSelectFolder={onSelectFolder}
          selectedFolderId={selectedFolderId}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
};
