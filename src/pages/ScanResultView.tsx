import { useState, useEffect, useRef } from 'react';
import { t, Locale } from '../i18n';
import SummaryGrid from '../components/SummaryGrid';
import FileTable from '../components/FileTable';
import { SyncProgress, SyncResult } from '../types';

interface Props {
  result: any;
  locale: Locale;
  onBack: () => void;
}

export default function ScanResultView({ result, locale, onBack }: Props) {
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState('');
  const progressRef = useRef<HTMLDivElement>(null);

  const statusBannerClass = result.status === 'ok' ? 'ok' : result.status === 'warning' ? 'warning' : 'error';
  const statusMessage = result.status === 'ok' ? t('result_ok') : result.status === 'warning' ? t('result_warning') : t('result_error');

  const needsSync = result.missingInBackup > 0 || result.modifiedCount > 0 || result.missingInSource > 0;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Calculate total size to sync
  const totalSyncSize = result.files
    .filter((f: any) => f.status === 'missing_in_backup' || f.status === 'modified')
    .reduce((sum: number, f: any) => sum + (f.sourceSize || 0), 0);

  // Listen for sync progress
  useEffect(() => {
    window.backcheck.onSyncProgress((progress: SyncProgress) => {
      setSyncProgress(progress);
      // Auto-scroll progress bar
      if (progressRef.current) {
        progressRef.current.scrollTop = progressRef.current.scrollHeight;
      }
    });
    return () => {
      window.backcheck.offSyncProgress();
    };
  }, []);

  const handleSync = async () => {
    const confirmMsg = t('sync_confirm');
    if (!window.confirm(confirmMsg)) return;

    setSyncing(true);
    setSyncProgress(null);
    setSyncResult(null);
    setSyncError('');

    try {
      const res = await window.backcheck.syncBackup({
        sourcePath: result.sourcePath,
        backupPath: result.backupPath,
        files: result.files,
      });

      if (res.error) {
        setSyncError(res.error);
      } else {
        setSyncResult(res);
      }
    } catch (err: any) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportHtml = async () => {
    await window.backcheck.generateHtml(result, locale);
  };

  const handleExportPdf = async () => {
    await window.backcheck.generatePdf(result, locale);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button className="btn btn-secondary" onClick={onBack}>← {t('back')}</button>
        <div className="export-bar">
          {needsSync && !syncResult && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <span className="spinner"></span>
                  {t('sync_progress')}
                </>
              ) : (
                <>🔄 {t('sync_backup')}</>
              )}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleExportHtml}>📄 {t('export_html')}</button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportPdf}>📑 {t('export_pdf')}</button>
        </div>
      </div>

      {/* Sync progress bar */}
      {syncing && syncProgress && (
        <div className="sync-progress-container">
          <div className="sync-progress-header">
            <span className="spinner"></span>
            <span>
              {syncProgress.phase === 'copying' ? t('sync_copying') :
               syncProgress.phase === 'deleting' ? t('sync_deleting') :
               t('sync_progress')}
            </span>
            <span className="sync-progress-count">
              {syncProgress.current} / {syncProgress.total}
            </span>
          </div>
          <div className="sync-progress-bar-bg">
            <div
              className="sync-progress-bar-fill"
              style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
            />
          </div>
          <div className="sync-progress-file" ref={progressRef}>
            {syncProgress.currentFile}
          </div>
        </div>
      )}

      {/* Sync result */}
      {syncResult && (
        <div className="sync-result-banner">
          <div className="sync-result-title">{t('sync_done')}</div>
          <div className="sync-result-stats">
            <span className="sync-stat">📁 {t('sync_copied')}: <strong>{syncResult.copied}</strong></span>
            <span className="sync-stat">🗑️ {t('sync_deleted')}: <strong>{syncResult.deleted}</strong></span>
            {syncResult.errors.length > 0 && (
              <span className="sync-stat sync-stat-error">❌ {t('sync_errors')}: <strong>{syncResult.errors.length}</strong></span>
            )}
            <span className="sync-stat">⏱️ {formatDuration(syncResult.duration)}</span>
          </div>
          {syncResult.errors.length > 0 && (
            <div className="sync-errors-list">
              {syncResult.errors.map((err, i) => (
                <div key={i} className="sync-error-item">{err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sync error */}
      {syncError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 14, marginBottom: 20, color: 'var(--red)', fontSize: 13 }}>
          ❌ {syncError}
        </div>
      )}

      <div className={`status-banner ${statusBannerClass}`}>
        {statusMessage}
      </div>

      <div className="paths-display">
        <p><strong>Source:</strong> {result.sourcePath}</p>
        <p><strong>Backup:</strong> {result.backupPath}</p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date(result.timestamp).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} — {t('duration')}: {formatDuration(result.duration)}
        </p>
      </div>

      <SummaryGrid
        items={[
          { value: result.totalFiles, label: t('total_files') },
          { value: result.okCount, label: t('identical'), color: 'var(--green)' },
          { value: result.missingInBackup, label: t('missing_backup'), color: 'var(--yellow)' },
          { value: result.missingInSource, label: t('missing_source'), color: 'var(--yellow)' },
          { value: result.modifiedCount, label: t('modified_files'), color: 'var(--yellow)' },
          { value: result.errorCount, label: t('errors'), color: 'var(--red)' },
        ]}
      />

      {/* Sync info banner when there's something to sync */}
      {needsSync && !syncResult && !syncing && (
        <div className="sync-info-banner">
          <div className="sync-info-text">
            💡 {locale === 'fr'
              ? `${result.missingInBackup + result.modifiedCount} fichier(s) à copier (${formatFileSize(totalSyncSize)}) — ${result.missingInSource} orphelin(s) à supprimer`
              : `${result.missingInBackup + result.modifiedCount} file(s) to copy (${formatFileSize(totalSyncSize)}) — ${result.missingInSource} orphan(s) to delete`}
          </div>
        </div>
      )}

      <div className="filter-bar">
        {['all', 'ok', 'missing_in_backup', 'missing_in_source', 'modified', 'error'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? (locale === 'fr' ? 'Tous' : 'All') : t(f)}
            {f !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                ({f === 'ok' ? result.okCount : f === 'missing_in_backup' ? result.missingInBackup : f === 'missing_in_source' ? result.missingInSource : f === 'modified' ? result.modifiedCount : result.errorCount})
              </span>
            )}
          </button>
        ))}
      </div>

      <FileTable files={result.files} locale={locale} filter={filter} />
    </div>
  );
}
