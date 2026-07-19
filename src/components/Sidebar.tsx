import { t, Locale } from '../i18n';

interface Props {
  currentPage: string;
  onNavigate: (page: 'scan' | 'history' | 'settings' | 'help') => void;
  locale: Locale;
}

export default function Sidebar({ currentPage, onNavigate, locale }: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>🎬 Backcheck</h1>
        <span>v1.0.0</span>
      </div>
      <nav>
        <a
          href="#"
          className={currentPage === 'scan' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); onNavigate('scan'); }}
        >
          <span className="icon">🔍</span>
          {t('nav_scan')}
        </a>
        <a
          href="#"
          className={currentPage === 'history' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); onNavigate('history'); }}
        >
          <span className="icon">📋</span>
          {t('nav_history')}
        </a>
        <a
          href="#"
          className={currentPage === 'settings' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); onNavigate('settings'); }}
        >
          <span className="icon">⚙️</span>
          {t('nav_settings')}
        </a>
        <a
          href="#"
          className={currentPage === 'help' ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); onNavigate('help'); }}
        >
          <span className="icon">❓</span>
          {t('nav_help')}
        </a>
      </nav>
      <div className="sidebar-footer">
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {locale === 'fr' ? 'Vérificateur de backups' : 'Backup verification tool'}
        </span>
      </div>
    </div>
  );
}
