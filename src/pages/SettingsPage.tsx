import { t, Locale } from '../i18n';

interface Props {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export default function SettingsPage({ locale, onLocaleChange }: Props) {
  return (
    <div>
      <div className="page-header">
        <h2>{t('settings_title')}</h2>
      </div>

      <div className="card">
        <div className="card-title">{t('language')}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className={`btn ${locale === 'fr' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLocaleChange('fr')}
          >
            🇫🇷 {t('french')}
          </button>
          <button
            className={`btn ${locale === 'en' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLocaleChange('en')}
          >
            🇬🇧 {t('english')}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{locale === 'fr' ? 'À propos' : 'About'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.8 }}>
          <p><strong>Backcheck</strong> v1.0.0</p>
          <p>{locale === 'fr'
            ? 'Outil de vérification de backups pour projets audiovisuels. Compare les dossiers source et backup, vérifie l\'intégrité des fichiers via checksums SHA256, et génère des rapports détaillés.'
            : 'Backup verification tool for audiovisual projects. Compares source and backup folders, verifies file integrity via SHA256 checksums, and generates detailed reports.'
          }</p>
          <p style={{ marginTop: 12 }}>
            {locale === 'fr'
              ? '💡 Astuce : Vous pouvez coller directement un chemin dans les champs de texte ou utiliser le bouton Parcourir.'
              : '💡 Tip: You can paste a path directly into the text fields or use the Browse button.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
