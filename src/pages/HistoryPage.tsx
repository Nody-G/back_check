import { useState, useEffect } from 'react';
import { t, Locale } from '../i18n';
import ScanResultView from './ScanResultView';

interface Props {
  locale: Locale;
  onOpenScan: (id: number) => void;
}

export default function HistoryPage({ locale, onOpenScan }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await window.backcheck.getHistory(100);
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const scan = await window.backcheck.getScanById(id);
      if (scan && !scan.error) {
        setSelectedScan(scan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      await window.backcheck.deleteScan(id);
      setHistory((prev) => prev.filter((s) => s.id !== id));
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedScan) {
    return <ScanResultView result={selectedScan} locale={locale} onBack={() => setSelectedScan(null)} />;
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>{t('history_title')}</h2>
        <p>{t('history_subtitle')}</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>{t('no_history')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('scan_date')}</th>
                <th>{t('scan_source')}</th>
                <th>{t('scan_backup')}</th>
                <th>{t('scan_status')}</th>
                <th>{t('scan_files')}</th>
                <th>{t('identical')}</th>
                <th>{t('modified_files')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((scan) => {
                const badgeClass = scan.status === 'ok' ? 'badge-ok' : scan.status === 'warning' ? 'badge-warning' : 'badge-error';
                return (
                  <tr key={scan.id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{scan.id}</td>
                    <td>{new Date(scan.timestamp).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}</td>
                    <td className="mono" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {scan.sourcePath}
                    </td>
                    <td className="mono" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {scan.backupPath}
                    </td>
                    <td><span className={`badge ${badgeClass}`}>{scan.status.toUpperCase()}</span></td>
                    <td style={{ textAlign: 'center' }}>{scan.totalFiles}</td>
                    <td style={{ textAlign: 'center', color: 'var(--green)' }}>{scan.okCount}</td>
                    <td style={{ textAlign: 'center', color: scan.modifiedCount > 0 ? 'var(--yellow)' : 'var(--text-muted)' }}>
                      {scan.modifiedCount + scan.missingInBackup + scan.missingInSource}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetail(scan.id)}>
                          👁 {t('view_details')}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(scan.id)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {loadingDetail && (
        <div className="loading-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,17,23,0.8)', zIndex: 100 }}>
          <div className="spinner" style={{ width: 40, height: 40 }}></div>
          <p>{t('loading')}</p>
        </div>
      )}
    </div>
  );
}
