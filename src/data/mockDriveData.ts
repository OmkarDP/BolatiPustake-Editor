export type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  size?: number;
  duration?: number;
  modifiedTime?: string;
  children?: DriveItem[];
};

export const mockDriveData: DriveItem[] = [
  {
    id: "root-1",
    name: "Podcast Episodes",
    mimeType: "application/vnd.google-apps.folder",
    isFolder: true,
    children: [
      {
        id: "folder-1-1",
        name: "Season 1",
        mimeType: "application/vnd.google-apps.folder",
        isFolder: true,
        children: [
          {
            id: "file-1-1-1",
            name: "Episode 001 - Introduction.mp3",
            mimeType: "audio/mpeg",
            isFolder: false,
            size: 15728640,
            duration: 1247,
            modifiedTime: "2024-01-15T10:30:00Z",
          },
          {
            id: "file-1-1-2",
            name: "Episode 002 - Getting Started.mp3",
            mimeType: "audio/mpeg",
            isFolder: false,
            size: 18874368,
            duration: 1498,
            modifiedTime: "2024-01-22T14:20:00Z",
          },
          {
            id: "file-1-1-3",
            name: "Episode 003 - Deep Dive.wav",
            mimeType: "audio/wav",
            isFolder: false,
            size: 52428800,
            duration: 1832,
            modifiedTime: "2024-01-29T09:15:00Z",
          },
        ],
      },
      {
        id: "folder-1-2",
        name: "Season 2",
        mimeType: "application/vnd.google-apps.folder",
        isFolder: true,
        children: [
          {
            id: "file-1-2-1",
            name: "Episode 201 - New Beginnings.mp3",
            mimeType: "audio/mpeg",
            isFolder: false,
            size: 20971520,
            duration: 1665,
            modifiedTime: "2024-03-05T11:00:00Z",
          },
          {
            id: "file-1-2-2",
            name: "Episode 202 - Advanced Topics.m4a",
            mimeType: "audio/x-m4a",
            isFolder: false,
            size: 16777216,
            duration: 1421,
            modifiedTime: "2024-03-12T16:45:00Z",
          },
        ],
      },
    ],
  },
  {
    id: "root-2",
    name: "Music Projects",
    mimeType: "application/vnd.google-apps.folder",
    isFolder: true,
    children: [
      {
        id: "folder-2-1",
        name: "Album Tracks",
        mimeType: "application/vnd.google-apps.folder",
        isFolder: true,
        children: [
          {
            id: "file-2-1-1",
            name: "Track 01 - Intro.wav",
            mimeType: "audio/wav",
            isFolder: false,
            size: 31457280,
            duration: 645,
            modifiedTime: "2024-02-10T08:30:00Z",
          },
          {
            id: "file-2-1-2",
            name: "Track 02 - Main Theme.wav",
            mimeType: "audio/wav",
            isFolder: false,
            size: 47185920,
            duration: 967,
            modifiedTime: "2024-02-11T13:20:00Z",
          },
          {
            id: "file-2-1-3",
            name: "Track 03 - Interlude.mp3",
            mimeType: "audio/mpeg",
            isFolder: false,
            size: 8388608,
            duration: 334,
            modifiedTime: "2024-02-12T10:15:00Z",
          },
        ],
      },
      {
        id: "folder-2-2",
        name: "Demos",
        mimeType: "application/vnd.google-apps.folder",
        isFolder: true,
        children: [
          {
            id: "file-2-2-1",
            name: "Demo A - Rough Mix.m4a",
            mimeType: "audio/x-m4a",
            isFolder: false,
            size: 12582912,
            duration: 892,
            modifiedTime: "2024-02-20T15:40:00Z",
          },
          {
            id: "file-2-2-2",
            name: "Demo B - Alternative Version.mp3",
            mimeType: "audio/mpeg",
            isFolder: false,
            size: 14680064,
            duration: 1165,
            modifiedTime: "2024-02-21T09:30:00Z",
          },
        ],
      },
    ],
  },
  {
    id: "root-3",
    name: "Audio Books",
    mimeType: "application/vnd.google-apps.folder",
    isFolder: true,
    children: [
      {
        id: "folder-3-1",
        name: "Chapter Recordings",
        mimeType: "application/vnd.google-apps.folder",
        isFolder: true,
        children: [
          {
            id: "file-3-1-1",
            name: "Chapter 01.m4a",
            mimeType: "audio/x-m4a",
            isFolder: false,
            size: 22020096,
            duration: 1564,
            modifiedTime: "2024-03-01T12:00:00Z",
          },
          {
            id: "file-3-1-2",
            name: "Chapter 02.m4a",
            mimeType: "audio/x-m4a",
            isFolder: false,
            size: 25165824,
            duration: 1789,
            modifiedTime: "2024-03-02T14:30:00Z",
          },
          {
            id: "file-3-1-3",
            name: "Chapter 03.wav",
            mimeType: "audio/wav",
            isFolder: false,
            size: 41943040,
            duration: 1456,
            modifiedTime: "2024-03-03T10:45:00Z",
          },
        ],
      },
    ],
  },
];
