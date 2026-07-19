export interface BackcheckAPI {
  selectFolder: () => Promise<string | null>;
  scan: (options: { sourcePath: string; backupPath: string }) => Promise<any>;
  onScanProgress: (callback: (progress: ScanProgress) => void) => void;
  offScanProgress: () => void;
  syncBackup: (options: { sourcePath: string; backupPath: string; files: any[] }) => Promise<any>;
  onSyncProgress: (callback: (progress: SyncProgress) => void) => void;
  offSyncProgress: () => void;
  listProjects: (rootPath: string) => Promise<any[]>;
  getHistory: (limit?: number) => Promise<any[]>;
  getScanById: (id: number) => Promise<any>;
  deleteScan: (id: number) => Promise<any>;
  generateHtml: (result: any, locale: string) => Promise<any>;
  generatePdf: (result: any, locale: string) => Promise<any>;
  openPath: (filePath: string) => Promise<void>;
  showInFolder: (filePath: string) => Promise<void>;
  takeScreenshot: (filePath: string) => Promise<any>;
  navigate: (route: string) => Promise<void>;
  onNavigate: (callback: (route: string) => void) => void;
}

export interface SyncProgress {
  current: number;
  total: number;
  currentFile: string;
  phase: 'copying' | 'deleting' | 'done';
}

export interface ScanProgress {
  phase: 'listing_source' | 'listing_backup' | 'comparing' | 'checksums';
  current: number;
  total: number;
  currentFile: string;
}

export interface SyncResult {
  copied: number;
  deleted: number;
  errors: string[];
  duration: number;
}

declare global {
  interface Window {
    backcheck: BackcheckAPI;
  }
}
