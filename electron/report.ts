import * as fs from 'fs';
import * as path from 'path';
import { ScanResult, Locale } from './types';

const statusLabels: Record<Locale, Record<string, string>> = {
  fr: {
    ok: 'OK',
    missing_in_backup: 'Manquant dans le backup',
    missing_in_source: 'Manquant dans la source',
    modified: 'Modifié',
    error: 'Erreur',
    report_title: 'Rapport Backcheck',
    summary: 'Résumé',
    total_files: 'Fichiers total',
    identical: 'Identiques',
    missing_backup: 'Manquants (backup)',
    missing_source: 'Manquants (source)',
    modified_files: 'Modifiés',
    errors: 'Erreurs',
    duration: 'Durée',
    source: 'Source',
    backup: 'Backup',
    status: 'Statut',
    file: 'Fichier',
    size: 'Taille',
    date: 'Date modif.',
    checksum: 'Checksum SHA256',
    global_status: 'Statut global',
    all_ok: 'Tous les fichiers sont synchronisés ✅',
    warnings: 'Attention : des différences ont été détectées ⚠️',
    errors_detected: 'Erreurs détectées ❌',
    scan_date: 'Date du scan',
    details: 'Détail des fichiers',
    no_backup: 'Pas de backup',
    no_source: 'Pas de source',
    size_mismatch: 'Taille différente',
    checksum_mismatch: 'Checksum différent',
    ms: 'ms',
    seconds: 's',
  },
  en: {
    ok: 'OK',
    missing_in_backup: 'Missing in backup',
    missing_in_source: 'Missing in source',
    modified: 'Modified',
    error: 'Error',
    report_title: 'Backcheck Report',
    summary: 'Summary',
    total_files: 'Total files',
    identical: 'Identical',
    missing_backup: 'Missing (backup)',
    missing_source: 'Missing (source)',
    modified_files: 'Modified',
    errors: 'Errors',
    duration: 'Duration',
    source: 'Source',
    backup: 'Backup',
    status: 'Status',
    file: 'File',
    size: 'Size',
    date: 'Modified date',
    checksum: 'SHA256 Checksum',
    global_status: 'Global status',
    all_ok: 'All files are synchronized ✅',
    warnings: 'Warning: differences detected ⚠️',
    errors_detected: 'Errors detected ❌',
    scan_date: 'Scan date',
    details: 'File details',
    no_backup: 'No backup',
    no_source: 'No source',
    size_mismatch: 'Different size',
    checksum_mismatch: 'Different checksum',
    ms: 'ms',
    seconds: 's',
  },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateHtmlReport(result: ScanResult, locale: Locale = 'fr'): string {
  const t = statusLabels[locale];

  const statusColor = result.status === 'ok' ? '#22c55e' : result.status === 'warning' ? '#f59e0b' : '#ef4444';
  const statusMessage = result.status === 'ok' ? t.all_ok : result.status === 'warning' ? t.warnings : t.errors_detected;

  const fileRows = result.files
    .sort((a, b) => {
      const order: Record<string, number> = { error: 0, modified: 1, missing_in_backup: 2, missing_in_source: 3, ok: 4 };
      return (order[a.status] ?? 5) - (order[b.status] ?? 5);
    })
    .map((f) => {
      const rowColor = f.status === 'ok' ? '#f0fdf4' : f.status === 'error' ? '#fef2f2' : '#fffbeb';
      const statusBadge = `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;color:white;background:${f.status === 'ok' ? '#22c55e' : f.status === 'error' ? '#ef4444' : '#f59e0b'}">${t[f.status] || f.status}</span>`;

      let detail = '';
      if (f.status === 'missing_in_backup') detail = t.no_backup;
      else if (f.status === 'missing_in_source') detail = t.no_source;
      else if (f.status === 'modified') {
        if (f.sourceSize !== f.backupSize) detail = t.size_mismatch;
        else detail = t.checksum_mismatch;
      } else if (f.status === 'error') detail = f.errorMessage || '';

      return `<tr style="background:${rowColor}">
        <td style="padding:8px;border:1px solid #e5e7eb;word-break:break-all">${escapeHtml(f.relativePath)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${statusBadge}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${f.sourceSize != null ? formatBytes(f.sourceSize) : '—'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${f.backupSize != null ? formatBytes(f.backupSize) : '—'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;font-family:monospace">${f.sourceChecksum ? escapeHtml(f.sourceChecksum.substring(0, 16)) + '…' : '—'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:12px">${escapeHtml(detail)}</td>
      </tr>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <title>${t.report_title} — Backcheck</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; background: #f9fafb; padding: 40px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .subtitle { color: #6b7280; margin-bottom: 32px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .summary-card .value { font-size: 32px; font-weight: 700; }
    .summary-card .label { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .status-banner { padding: 16px 24px; border-radius: 8px; font-size: 18px; font-weight: 600; margin-bottom: 24px; color: white; background: ${statusColor}; }
    .paths { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
    .paths p { margin-bottom: 4px; font-size: 14px; }
    .paths strong { color: #374151; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th { background: #1f2937; color: white; padding: 12px 8px; text-align: left; font-size: 13px; }
    td { font-size: 13px; }
    h2 { font-size: 20px; margin-bottom: 16px; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; }
    @media print { body { padding: 20px; } .container { max-width: 100%; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎬 ${t.report_title}</h1>
    <p class="subtitle">${t.scan_date}: ${new Date(result.timestamp).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}</p>

    <div class="status-banner">${statusMessage}</div>

    <div class="paths">
      <p><strong>${t.source}:</strong> ${escapeHtml(result.sourcePath)}</p>
      <p><strong>${t.backup}:</strong> ${escapeHtml(result.backupPath)}</p>
    </div>

    <div class="summary-grid">
      <div class="summary-card"><div class="value">${result.totalFiles}</div><div class="label">${t.total_files}</div></div>
      <div class="summary-card"><div class="value" style="color:#22c55e">${result.okCount}</div><div class="label">${t.identical}</div></div>
      <div class="summary-card"><div class="value" style="color:#f59e0b">${result.missingInBackup}</div><div class="label">${t.missing_backup}</div></div>
      <div class="summary-card"><div class="value" style="color:#f59e0b">${result.missingInSource}</div><div class="label">${t.missing_source}</div></div>
      <div class="summary-card"><div class="value" style="color:#f59e0b">${result.modifiedCount}</div><div class="label">${t.modified_files}</div></div>
      <div class="summary-card"><div class="value" style="color:#ef4444">${result.errorCount}</div><div class="label">${t.errors}</div></div>
      <div class="summary-card"><div class="value">${formatDuration(result.duration)}</div><div class="label">${t.duration}</div></div>
    </div>

    <h2>${t.details}</h2>
    <table>
      <thead>
        <tr>
          <th>${t.file}</th>
          <th>${t.status}</th>
          <th>${t.source} ${t.size}</th>
          <th>${t.backup} ${t.size}</th>
          <th>${t.checksum}</th>
          <th>${locale === 'fr' ? 'Détail' : 'Detail'}</th>
        </tr>
      </thead>
      <tbody>
        ${fileRows}
      </tbody>
    </table>

    <p class="footer">Generated by Backcheck — ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;
}

export async function generatePdfReport(result: ScanResult, locale: Locale = 'fr', outputPath: string): Promise<string> {
  const html = generateHtmlReport(result, locale);
  const htmlPath = outputPath.replace(/\.pdf$/, '.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');

  // Use electron's printToPDF via a workaround: save HTML and let main process convert
  // For now, save the HTML file — PDF conversion happens in main.ts
  return htmlPath;
}
