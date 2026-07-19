import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { ScanResult, ScanHistoryEntry, FileStatus } from './types';

let db: SqlJsDatabase | null = null;
let dbPath: string = '';

function getDbPath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'backcheck.db');
}

function getWasmPath(): string {
  // In packaged mode, the WASM is unpacked from asar (asarUnpack config)
  // app.asar.unpacked replaces app.asar in the path for unpacked files
  let wasmPath = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
  
  // If running from asar, try the unpacked version first
  if (app.isPackaged) {
    const unpackedPath = wasmPath.replace('app.asar', 'app.asar.unpacked');
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath;
    }
  }
  
  return wasmPath;
}

export async function initDatabase(): Promise<void> {
  if (db) return;
  dbPath = getDbPath();

  const wasmPath = getWasmPath();
  const wasmBinary = fs.existsSync(wasmPath) ? fs.readFileSync(wasmPath) : undefined;

  const SQL = await initSqlJs({
    wasmBinary,
  });

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      sourcePath TEXT NOT NULL,
      backupPath TEXT NOT NULL,
      totalFiles INTEGER NOT NULL,
      okCount INTEGER NOT NULL,
      missingInBackup INTEGER NOT NULL,
      missingInSource INTEGER NOT NULL,
      modifiedCount INTEGER NOT NULL,
      errorCount INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      status TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS scan_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scanId INTEGER NOT NULL,
      relativePath TEXT NOT NULL,
      status TEXT NOT NULL,
      sourceSize INTEGER,
      backupSize INTEGER,
      sourceModified TEXT,
      backupModified TEXT,
      sourceChecksum TEXT,
      backupChecksum TEXT,
      errorMessage TEXT,
      FOREIGN KEY (scanId) REFERENCES scans(id) ON DELETE CASCADE
    )
  `);

  saveToDisk();
}

function saveToDisk(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getNextScanId(): number {
  if (!db) throw new Error('Database not initialized');
  const result = db.exec('SELECT MAX(id) as maxId FROM scans');
  if (result.length > 0 && result[0].values[0][0] != null) {
    return (result[0].values[0][0] as number) + 1;
  }
  return 1;
}

export function saveScanResult(result: ScanResult): number {
  if (!db) throw new Error('Database not initialized');

  db.run(
    `INSERT INTO scans (timestamp, sourcePath, backupPath, totalFiles, okCount, missingInBackup, missingInSource, modifiedCount, errorCount, duration, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      result.timestamp,
      result.sourcePath,
      result.backupPath,
      result.totalFiles,
      result.okCount,
      result.missingInBackup,
      result.missingInSource,
      result.modifiedCount,
      result.errorCount,
      result.duration,
      result.status,
    ]
  );

  const idResult = db.exec('SELECT last_insert_rowid()');
  const scanId = idResult[0].values[0][0] as number;

  const stmt = db.prepare(
    `INSERT INTO scan_files (scanId, relativePath, status, sourceSize, backupSize, sourceModified, backupModified, sourceChecksum, backupChecksum, errorMessage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const file of result.files) {
    stmt.run([
      scanId,
      file.relativePath,
      file.status,
      file.sourceSize ?? null,
      file.backupSize ?? null,
      file.sourceModified ?? null,
      file.backupModified ?? null,
      file.sourceChecksum ?? null,
      file.backupChecksum ?? null,
      file.errorMessage ?? null,
    ]);
  }
  stmt.free();

  saveToDisk();
  return scanId;
}

export function getScanHistory(limit: number = 50): ScanHistoryEntry[] {
  if (!db) throw new Error('Database not initialized');

  const stmt = db.prepare(
    `SELECT id, timestamp, sourcePath, backupPath, totalFiles, okCount, missingInBackup, missingInSource, modifiedCount, errorCount, duration, status
     FROM scans ORDER BY timestamp DESC LIMIT ?`
  );
  stmt.bind([limit]);

  const results: ScanHistoryEntry[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row as unknown as ScanHistoryEntry);
  }
  stmt.free();
  return results;
}

export function getScanById(id: number): ScanResult | null {
  if (!db) throw new Error('Database not initialized');

  const scanStmt = db.prepare('SELECT * FROM scans WHERE id = ?');
  scanStmt.bind([id]);
  if (!scanStmt.step()) {
    scanStmt.free();
    return null;
  }
  const scan = scanStmt.getAsObject();
  scanStmt.free();

  const filesStmt = db.prepare('SELECT * FROM scan_files WHERE scanId = ?');
  filesStmt.bind([id]);
  const files: any[] = [];
  while (filesStmt.step()) {
    files.push(filesStmt.getAsObject());
  }
  filesStmt.free();

  return {
    id: scan.id as number,
    timestamp: scan.timestamp as string,
    sourcePath: scan.sourcePath as string,
    backupPath: scan.backupPath as string,
    totalFiles: scan.totalFiles as number,
    okCount: scan.okCount as number,
    missingInBackup: scan.missingInBackup as number,
    missingInSource: scan.missingInSource as number,
    modifiedCount: scan.modifiedCount as number,
    errorCount: scan.errorCount as number,
    duration: scan.duration as number,
    status: scan.status as 'ok' | 'warning' | 'error',
    files: files.map((f) => ({
      relativePath: f.relativePath as string,
      status: f.status as FileStatus,
      sourceSize: f.sourceSize as number | undefined,
      backupSize: f.backupSize as number | undefined,
      sourceModified: f.sourceModified as string | undefined,
      backupModified: f.backupModified as string | undefined,
      sourceChecksum: f.sourceChecksum as string | undefined,
      backupChecksum: f.backupChecksum as string | undefined,
      errorMessage: f.errorMessage as string | undefined,
    })),
  };
}

export function deleteScan(id: number): void {
  if (!db) throw new Error('Database not initialized');
  db.run('DELETE FROM scan_files WHERE scanId = ?', [id]);
  db.run('DELETE FROM scans WHERE id = ?', [id]);
  saveToDisk();
}

export function closeDatabase(): void {
  if (db) {
    saveToDisk();
    db.close();
    db = null;
  }
}
