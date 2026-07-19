import { t, Locale } from '../i18n';

interface FileResult {
  relativePath: string;
  status: string;
  sourceSize?: number;
  backupSize?: number;
  sourceChecksum?: string;
  backupChecksum?: string;
  errorMessage?: string;
}

interface Props {
  files: FileResult[];
  locale: Locale;
  filter: string;
}

function formatBytes(bytes?: number): string {
  if (bytes == null) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusBadge(status: string): { className: string; label: string } {
  switch (status) {
    case 'ok': return { className: 'badge-ok', label: t('ok') };
    case 'missing_in_backup': return { className: 'badge-warning', label: t('missing_in_backup') };
    case 'missing_in_source': return { className: 'badge-warning', label: t('missing_in_source') };
    case 'modified': return { className: 'badge-warning', label: t('modified') };
    case 'error': return { className: 'badge-error', label: t('error') };
    default: return { className: '', label: status };
  }
}

function getDetail(f: FileResult): string {
  switch (f.status) {
    case 'missing_in_backup': return t('no_backup');
    case 'missing_in_source': return t('no_source');
    case 'modified':
      if (f.sourceSize !== f.backupSize) return t('size_mismatch');
      return t('checksum_mismatch');
    case 'error': return f.errorMessage || '';
    default: return '';
  }
}

export default function FileTable({ files, locale, filter }: Props) {
  const filtered = filter === 'all' ? files : files.filter((f) => f.status === filter);

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <p>{locale === 'fr' ? 'Aucun fichier dans cette catégorie' : 'No files in this category'}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>{t('file')}</th>
            <th>{t('status')}</th>
            <th>{t('source_size')}</th>
            <th>{t('backup_size')}</th>
            <th>{t('checksum')}</th>
            <th>{t('detail')}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((f, i) => {
            const badge = getStatusBadge(f.status);
            return (
              <tr key={i}>
                <td className="mono" style={{ maxWidth: 400, wordBreak: 'break-all' }}>{f.relativePath}</td>
                <td><span className={`badge ${badge.className}`}>{badge.label}</span></td>
                <td style={{ textAlign: 'right' }}>{formatBytes(f.sourceSize)}</td>
                <td style={{ textAlign: 'right' }}>{formatBytes(f.backupSize)}</td>
                <td className="mono" style={{ fontSize: 11 }}>
                  {f.sourceChecksum ? f.sourceChecksum.substring(0, 16) + '…' : '—'}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{getDetail(f)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
