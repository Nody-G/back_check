export interface ScanOptions {
  sourcePath: string;
  backupPath: string;
  projectFilter?: string;
}

export type FileStatus = 'ok' | 'missing_in_backup' | 'missing_in_source' | 'modified' | 'error';

export interface FileResult {
  relativePath: string;
  status: FileStatus;
  sourceSize?: number;
  backupSize?: number;
  sourceModified?: string;
  backupModified?: string;
  sourceChecksum?: string;
  backupChecksum?: string;
  errorMessage?: string;
}

export interface ScanResult {
  id?: number;
  timestamp: string;
  sourcePath: string;
  backupPath: string;
  totalFiles: number;
  okCount: number;
  missingInBackup: number;
  missingInSource: number;
  modifiedCount: number;
  errorCount: number;
  duration: number;
  status: 'ok' | 'warning' | 'error';
  files: FileResult[];
}

export interface ScanHistoryEntry {
  id: number;
  timestamp: string;
  sourcePath: string;
  backupPath: string;
  totalFiles: number;
  okCount: number;
  missingInBackup: number;
  missingInSource: number;
  modifiedCount: number;
  errorCount: number;
  duration: number;
  status: 'ok' | 'warning' | 'error';
}

export interface ProjectFolder {
  name: string;
  path: string;
  subfolders: string[];
}

export interface SyncOptions {
  sourcePath: string;
  backupPath: string;
  files: FileResult[];
}

export interface SyncProgress {
  current: number;
  total: number;
  currentFile: string;
  phase: 'copying' | 'deleting' | 'done';
}

export interface SyncResult {
  copied: number;
  deleted: number;
  errors: string[];
  duration: number;
}

export interface ScanProgress {
  phase: 'listing_source' | 'listing_backup' | 'comparing' | 'checksums';
  current: number;
  total: number;
  currentFile: string;
}

export type Locale = 'fr' | 'en';
