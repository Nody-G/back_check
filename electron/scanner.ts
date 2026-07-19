import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ScanOptions, ScanResult, FileResult, FileStatus, ProjectFolder, SyncOptions, SyncResult, SyncProgress, ScanProgress } from './types';

function computeSHA256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

function walkDir(dir: string, basePath: string, files: Map<string, { fullPath: string; size: number; mtime: string }>) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, basePath, files);
    } else if (entry.isFile()) {
      try {
        const stats = fs.statSync(fullPath);
        const relativePath = path.relative(basePath, fullPath);
        files.set(relativePath, {
          fullPath,
          size: stats.size,
          mtime: stats.mtime.toISOString(),
        });
      } catch {
        // skip files we can't stat
      }
    }
  }
}

export async function scanProject(
  options: ScanOptions,
  onProgress?: (progress: ScanProgress) => void
): Promise<ScanResult> {
  const startTime = Date.now();

  const sourceFiles = new Map<string, { fullPath: string; size: number; mtime: string }>();
  const backupFiles = new Map<string, { fullPath: string; size: number; mtime: string }>();

  // Phase 1: List source files
  onProgress?.({ phase: 'listing_source', current: 0, total: 0, currentFile: options.sourcePath });
  walkDir(options.sourcePath, options.sourcePath, sourceFiles);
  onProgress?.({ phase: 'listing_source', current: sourceFiles.size, total: sourceFiles.size, currentFile: '' });

  // Phase 2: List backup files
  onProgress?.({ phase: 'listing_backup', current: 0, total: 0, currentFile: options.backupPath });
  walkDir(options.backupPath, options.backupPath, backupFiles);
  onProgress?.({ phase: 'listing_backup', current: backupFiles.size, total: backupFiles.size, currentFile: '' });

  const allPaths = new Set([...sourceFiles.keys(), ...backupFiles.keys()]);
  const results: FileResult[] = [];
  const totalPaths = allPaths.size;
  let processed = 0;

  // Phase 3: Compare files
  for (const relPath of allPaths) {
    processed++;
    const src = sourceFiles.get(relPath);
    const bkp = backupFiles.get(relPath);

    // Emit progress every 10 files or on the last one
    if (processed % 10 === 0 || processed === totalPaths) {
      onProgress?.({ phase: 'comparing', current: processed, total: totalPaths, currentFile: relPath });
    }

    if (src && !bkp) {
      results.push({
        relativePath: relPath,
        status: 'missing_in_backup',
        sourceSize: src.size,
        sourceModified: src.mtime,
      });
    } else if (!src && bkp) {
      results.push({
        relativePath: relPath,
        status: 'missing_in_source',
        backupSize: bkp.size,
        backupModified: bkp.mtime,
      });
    } else if (src && bkp) {
      // Compare size first (fast check)
      if (src.size !== bkp.size) {
        results.push({
          relativePath: relPath,
          status: 'modified',
          sourceSize: src.size,
          backupSize: bkp.size,
          sourceModified: src.mtime,
          backupModified: bkp.mtime,
        });
      } else {
        // Same size — compare checksums
        onProgress?.({ phase: 'checksums', current: processed, total: totalPaths, currentFile: relPath });
        try {
          const [srcHash, bkpHash] = await Promise.all([
            computeSHA256(src.fullPath),
            computeSHA256(bkp.fullPath),
          ]);
          if (srcHash === bkpHash) {
            results.push({
              relativePath: relPath,
              status: 'ok',
              sourceSize: src.size,
              backupSize: bkp.size,
              sourceModified: src.mtime,
              backupModified: bkp.mtime,
              sourceChecksum: srcHash,
              backupChecksum: bkpHash,
            });
          } else {
            results.push({
              relativePath: relPath,
              status: 'modified',
              sourceSize: src.size,
              backupSize: bkp.size,
              sourceModified: src.mtime,
              backupModified: bkp.mtime,
              sourceChecksum: srcHash,
              backupChecksum: bkpHash,
            });
          }
        } catch (err: any) {
          results.push({
            relativePath: relPath,
            status: 'error',
            sourceSize: src.size,
            backupSize: bkp.size,
            errorMessage: err.message,
          });
        }
      }
    }
  }

  const duration = Date.now() - startTime;
  const okCount = results.filter((r) => r.status === 'ok').length;
  const missingInBackup = results.filter((r) => r.status === 'missing_in_backup').length;
  const missingInSource = results.filter((r) => r.status === 'missing_in_source').length;
  const modifiedCount = results.filter((r) => r.status === 'modified').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  let status: 'ok' | 'warning' | 'error' = 'ok';
  if (errorCount > 0) status = 'error';
  else if (missingInBackup > 0 || missingInSource > 0 || modifiedCount > 0) status = 'warning';

  return {
    timestamp: new Date().toISOString(),
    sourcePath: options.sourcePath,
    backupPath: options.backupPath,
    totalFiles: results.length,
    okCount,
    missingInBackup,
    missingInSource,
    modifiedCount,
    errorCount,
    duration,
    status,
    files: results,
  };
}

export function listProjectFolders(rootPath: string): ProjectFolder[] {
  if (!fs.existsSync(rootPath)) return [];
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  const projects: ProjectFolder[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(rootPath, entry.name);
      const subfolders = fs.readdirSync(fullPath, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
      projects.push({
        name: entry.name,
        path: fullPath,
        subfolders,
      });
    }
  }
  return projects;
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function syncBackup(
  options: SyncOptions,
  onProgress: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let copied = 0;
  let deleted = 0;

  // Files to sync: missing_in_backup + modified
  const filesToSync = options.files.filter(
    (f) => f.status === 'missing_in_backup' || f.status === 'modified'
  );
  // Files to delete from backup: missing_in_source
  const filesToDelete = options.files.filter(
    (f) => f.status === 'missing_in_source'
  );

  const total = filesToSync.length + filesToDelete.length;
  let current = 0;

  // Phase 1: Copy missing/modified files from source → backup
  for (const file of filesToSync) {
    current++;
    const srcPath = path.join(options.sourcePath, file.relativePath);
    const destPath = path.join(options.backupPath, file.relativePath);

    onProgress({
      current,
      total,
      currentFile: file.relativePath,
      phase: 'copying',
    });

    try {
      // Ensure destination directory exists
      ensureDir(path.dirname(destPath));

      // Copy file (preserves content, overwrites if exists)
      fs.copyFileSync(srcPath, destPath);
      copied++;
    } catch (err: any) {
      errors.push(`${file.relativePath}: ${err.message}`);
    }
  }

  // Phase 2: Delete files from backup that don't exist in source
  for (const file of filesToDelete) {
    current++;
    const destPath = path.join(options.backupPath, file.relativePath);

    onProgress({
      current,
      total,
      currentFile: file.relativePath,
      phase: 'deleting',
    });

    try {
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
        deleted++;
      }
    } catch (err: any) {
      errors.push(`${file.relativePath}: ${err.message}`);
    }
  }

  onProgress({ current: total, total, currentFile: '', phase: 'done' });

  return {
    copied,
    deleted,
    errors,
    duration: Date.now() - startTime,
  };
}
