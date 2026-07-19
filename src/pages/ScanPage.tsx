import { useState, useEffect, useRef } from 'react';
import { t, Locale } from '../i18n';
import { ScanProgress } from '../types';
import ScanResultView from './ScanResultView';

interface Props {
  locale: Locale;
}

const phaseKeys: Record<string, string> = {
  listing_source: 'scan_listing_source',
  listing_backup: 'scan_listing_backup',
  comparing: 'scan_comparing',
  checksums: 'scan_checksums',
};

export default function ScanPage({ locale }: Props) {
  const [sourcePath, setSourcePath] = useState('');
  const [backupPath, setBackupPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const progressRef = useRef<ScanProgress | null>(null);

  useEffect(() => {
    window.backcheck.onScanProgress((progress: ScanProgress) => {
      progressRef.current = progress;
      setScanProgress({ ...progress });
    });
    return () => {
      window.backcheck.offScanProgress();
    };
  }, []);

  const handleSelectSource = async () => {
    const folder = await window.backcheck.selectFolder();
    if (folder) setSourcePath(folder);
  };

  const handleSelectBackup = async () => {
    const folder = await window.backcheck.selectFolder();
    if (folder) setBackupPath(folder);
  };

  const handleScan = async () => {
    if (!sourcePath || !backupPath) return;
    setScanning(true);
    setScanProgress(null);
    setError('');
    setResult(null);

    try {
      const res = await window.backcheck.scan({ sourcePath, backupPath });
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
      setScanProgress(null);
    }
  };

  if (result) {
    return <ScanResultView result={result} locale={locale} onBack={() => setResult(null)} />;
  }

  return (
    <div>
      <div className="page-header">
        <h2>{t('scan_title')}</h2>
        <p>{t('scan_subtitle')}</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>
            {t('source_folder')}
          </label>
          <div className="input-group">
            <input
              className="input-field"
              type="text"
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              placeholder={locale === 'fr' ? 'Chemin du dossier source ou collez-le ici…' : 'Source folder path or paste here…'}
            />
            <button className="btn btn-secondary" onClick={handleSelectSource}>{t('select_folder')}</button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>
            {t('backup_folder')}
          </label>
          <div className="input-group">
            <input
              className="input-field"
              type="text"
              value={backupPath}
              onChange={(e) => setBackupPath(e.target.value)}
              placeholder={locale === 'fr' ? 'Chemin du dossier backup ou collez-le ici…' : 'Backup folder path or paste here…'}
            />
            <button className="btn btn-secondary" onClick={handleSelectBackup}>{t('select_folder')}</button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 14, marginBottom: 20, color: 'var(--red)', fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleScan}
          disabled={!sourcePath || !backupPath || scanning}
          style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 15 }}
        >
          {scanning ? (
            <>
              <span className="spinner"></span>
              {t('scanning')}
            </>
          ) : (
            <>🔍 {t('start_scan')}</>
          )}
        </button>
      </div>

      {scanning && (
        <div className="loading-overlay">
          <div className="spinner" style={{ width: 40, height: 40 }}></div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            {scanProgress
              ? t(phaseKeys[scanProgress.phase] || 'scanning')
              : t('scanning')
            }
          </p>
          {scanProgress && scanProgress.total > 0 && (
            <>
              <div style={{ width: 340, marginBottom: 8 }}>
                <div className="sync-progress-bar">
                  <div
                    className="sync-progress-fill"
                    style={{ width: `${Math.round((scanProgress.current / scanProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                {scanProgress.current} / {scanProgress.total} {t('scan_progress_files')}
                {' '}({Math.round((scanProgress.current / scanProgress.total) * 100)}%)
              </p>
            </>
          )}
          {scanProgress && scanProgress.total === 0 && scanProgress.phase.startsWith('listing') && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {scanProgress.current > 0
                ? `${scanProgress.current} ${t('scan_files_found')}`
                : t('scan_walking')
              }
            </p>
          )}
          {scanProgress && scanProgress.currentFile && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {scanProgress.currentFile}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
