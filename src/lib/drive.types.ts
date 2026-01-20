export type DriveNode = {
  id: string;
  name: string;
  mimeType: string;
  parents: string[];
  kind: "folder" | "file";
  downloadUrl: string | null;
  children: DriveNode[];
};
