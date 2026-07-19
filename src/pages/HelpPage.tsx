import { t, Locale } from '../i18n';

interface Props {
  locale: Locale;
}

export default function HelpPage({ locale }: Props) {
  const isFr = locale === 'fr';

  return (
    <div>
      <div className="page-header">
        <h2>{isFr ? 'Aide' : 'Help'}</h2>
        <p>{isFr ? 'Comment utiliser Backcheck' : 'How to use Backcheck'}</p>
      </div>

      {/* Section 1 : Principe */}
      <div className="card">
        <div className="card-title">🎬 {isFr ? 'Principe général' : 'General principle'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <p>
            {isFr
              ? 'Backcheck compare un dossier source (vos projets originaux) avec un dossier backup (vos copies) pour vérifier que tout est bien synchronisé.'
              : 'Backcheck compares a source folder (your original projects) with a backup folder (your copies) to verify everything is properly synchronized.'}
          </p>
          <p style={{ marginTop: 8 }}>
            {isFr
              ? 'L\'application scanne récursivement les deux dossiers, compare chaque fichier et vous signale les différences : fichiers manquants, modifiés, corrompus, ou en erreur.'
              : 'The app recursively scans both folders, compares each file, and reports differences: missing files, modified files, corrupted files, or errors.'}
          </p>
        </div>
      </div>

      {/* Section 2 : Scanner */}
      <div className="card">
        <div className="card-title">🔍 {isFr ? 'Lancer un scan' : 'Starting a scan'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <ol style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Dossier source' : 'Source folder'}</strong> — {isFr
                ? 'Sélectionnez le dossier original de votre projet (ex: D:\\20220713_ODESZA_ITS_ONLY). Vous pouvez cliquer sur "Parcourir" ou coller le chemin directement dans le champ.'
                : 'Select the original project folder (e.g. D:\\20220713_ODESZA_ITS_ONLY). You can click "Browse" or paste the path directly in the field.'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Dossier backup' : 'Backup folder'}</strong> — {isFr
                ? 'Sélectionnez la copie de backup correspondante (ex: Z:\\Backups\\ODESZA_ITS_ONLY).'
                : 'Select the corresponding backup copy (e.g. Z:\\Backups\\ODESZA_ITS_ONLY).'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Lancer le scan' : 'Start the scan'}</strong> — {isFr
                ? 'Cliquez sur "Lancer le scan". L\'application va parcourir tous les fichiers récursivement.'
                : 'Click "Start scan". The app will recursively walk through all files.'}
            </li>
          </ol>
        </div>
      </div>

      {/* Section 3 : Ce qui est vérifié */}
      <div className="card">
        <div className="card-title">✅ {isFr ? 'Ce qui est vérifié' : 'What is checked'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <p>{isFr ? 'Pour chaque fichier, Backcheck effectue ces vérifications dans l\'ordre :' : 'For each file, Backcheck performs these checks in order:'}</p>
          <ol style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Présence' : 'Presence'}</strong> — {isFr
                ? 'Le fichier existe-t-il dans les deux dossiers ? Si un fichier est dans la source mais pas dans le backup, il est marqué "Manquant dans le backup". L\'inverse est aussi détecté.'
                : 'Does the file exist in both folders? If a file is in the source but not in the backup, it\'s marked "Missing in backup". The reverse is also detected.'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Taille du fichier' : 'File size'}</strong> — {isFr
                ? 'Si le fichier existe des deux côtés, les tailles sont comparées. Si elles diffèrent, le fichier est marqué "Modifié" (vérification rapide, sans lire le contenu).'
                : 'If the file exists on both sides, sizes are compared. If they differ, the file is marked "Modified" (fast check, without reading content).'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Checksum SHA256' : 'SHA256 checksum'}</strong> — {isFr
                ? 'Si les tailles sont identiques, Backcheck calcule le hash SHA256 des deux fichiers. C\'est une empreinte numérique unique du contenu. Si les hashs diffèrent, le fichier a été modifié/corrompu même si la taille est la même. C\'est la vérification la plus fiable mais aussi la plus lente.'
                : 'If sizes are identical, Backcheck computes the SHA256 hash of both files. This is a unique digital fingerprint of the content. If the hashes differ, the file was modified/corrupted even if the size is the same. This is the most reliable but also the slowest check.'}
            </li>
          </ol>
        </div>
      </div>

      {/* Section 4 : Statuts */}
      <div className="card">
        <div className="card-title">🏷️ {isFr ? 'Signification des statuts' : 'Status meanings'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{isFr ? 'Statut' : 'Status'}</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{isFr ? 'Signification' : 'Meaning'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}><span className="badge badge-ok">OK</span></td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{isFr ? 'Le fichier est identique dans la source et le backup (même contenu, même checksum).' : 'The file is identical in source and backup (same content, same checksum).'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}><span className="badge badge-warning">{isFr ? 'Manquant' : 'Missing'}</span></td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{isFr ? 'Le fichier existe dans la source mais pas dans le backup. Il faut le copier.' : 'The file exists in the source but not in the backup. You need to copy it.'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}><span className="badge badge-warning">{isFr ? 'Manquant (source)' : 'Missing (source)'}</span></td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{isFr ? 'Le fichier existe dans le backup mais pas dans la source. Peut-être un ancien fichier supprimé de la source.' : 'The file exists in the backup but not in the source. Possibly an old file deleted from the source.'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}><span className="badge badge-warning">{isFr ? 'Modifié' : 'Modified'}</span></td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{isFr ? 'Le fichier existe des deux côtés mais diffère (taille ou checksum). Le backup n\'est pas à jour ou le fichier a été corrompu.' : 'The file exists on both sides but differs (size or checksum). The backup is outdated or the file was corrupted.'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px' }}><span className="badge badge-error">{isFr ? 'Erreur' : 'Error'}</span></td>
                <td style={{ padding: '8px 12px' }}>{isFr ? 'Impossible de lire ou comparer le fichier (droits d\'accès, disque déconnecté, fichier verrouillé…).' : 'Unable to read or compare the file (access rights, disconnected drive, locked file…).'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5 : Résultats et filtres */}
      <div className="card">
        <div className="card-title">📊 {isFr ? 'Lire les résultats' : 'Reading results'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <p>{isFr ? 'Après un scan, vous voyez :' : 'After a scan, you see:'}</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>
              <strong>{isFr ? 'Bandeau de statut global' : 'Global status banner'}</strong> — {isFr
                ? 'Vert si tout est OK, orange s\'il y a des différences, rouge en cas d\'erreur.'
                : 'Green if all OK, orange if there are differences, red if errors occurred.'}
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>{isFr ? 'Cartes de résumé' : 'Summary cards'}</strong> — {isFr
                ? 'Nombre total de fichiers, identiques, manquants, modifiés, erreurs, et durée du scan.'
                : 'Total files, identical, missing, modified, errors, and scan duration.'}
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>{isFr ? 'Barre de filtres' : 'Filter bar'}</strong> — {isFr
                ? 'Cliquez sur un statut pour n\'afficher que les fichiers de cette catégorie. "Tous" affiche tout.'
                : 'Click a status to show only files in that category. "All" shows everything.'}
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>{isFr ? 'Tableau détaillé' : 'Detailed table'}</strong> — {isFr
                ? 'Chaque fichier avec son statut, taille source/backup, début du checksum SHA256, et détail de la différence.'
                : 'Each file with its status, source/backup size, beginning of SHA256 checksum, and difference detail.'}
            </li>
          </ul>
        </div>
      </div>

      {/* Section 6 : Rapports */}
      <div className="card">
        <div className="card-title">📄 {isFr ? 'Exporter un rapport' : 'Exporting a report'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <p>{isFr ? 'Depuis la vue des résultats, deux boutons d\'export sont disponibles :' : 'From the results view, two export buttons are available:'}</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>
              <strong>📄 HTML</strong> — {isFr
                ? 'Génère un fichier HTML autonome (ouvrable dans n\'importe quel navigateur) avec le résumé et le détail complet. Idéal pour archiver ou imprimer.'
                : 'Generates a standalone HTML file (openable in any browser) with the summary and full details. Ideal for archiving or printing.'}
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>📑 PDF</strong> — {isFr
                ? 'Génère un fichier PDF via le moteur d\'impression d\'Electron. Même contenu que le HTML, formaté pour impression A4.'
                : 'Generates a PDF file via Electron\'s print engine. Same content as HTML, formatted for A4 printing.'}
            </li>
          </ul>
        </div>
      </div>

      {/* Section 7 : Historique */}
      <div className="card">
        <div className="card-title">📋 {isFr ? 'Historique' : 'History'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <p>{isFr
            ? 'Chaque scan est automatiquement sauvegardé dans une base de données locale (SQLite). Vous pouvez consulter l\'historique complet depuis l\'onglet "Historique".'
            : 'Every scan is automatically saved in a local database (SQLite). You can view the full history from the "History" tab.'}</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>{isFr ? 'Cliquez sur "Voir détails" pour revoir les résultats d\'un scan précédent.' : 'Click "View details" to review results from a previous scan.'}</li>
            <li style={{ marginBottom: 6 }}>{isFr ? 'Cliquez sur 🗑 pour supprimer un scan de l\'historique.' : 'Click 🗑 to delete a scan from history.'}</li>
            <li style={{ marginBottom: 6 }}>{isFr ? 'Vous pouvez exporter un rapport HTML/PDF depuis la vue détaillée.' : 'You can export an HTML/PDF report from the detailed view.'}</li>
          </ul>
        </div>
      </div>

      {/* Section 8 : Conseils */}
      <div className="card">
        <div className="card-title">💡 {isFr ? 'Conseils d\'utilisation' : 'Usage tips'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Performance' : 'Performance'}</strong> — {isFr
                ? 'Le calcul des checksums SHA256 est lent sur les gros fichiers (vidéos de plusieurs Go). Pour un premier check rapide, la comparaison de taille suffit souvent à détecter les fichiers manquants ou de taille différente.'
                : 'SHA256 checksum computation is slow on large files (multi-GB videos). For a quick first check, size comparison is often enough to detect missing or differently-sized files.'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'NAS Synology' : 'Synology NAS'}</strong> — {isFr
                ? 'Assurez-vous que le lecteur réseau est bien monté avant de lancer un scan. Le chemin doit ressembler à Z:\\MonNAS\\Backups\\. Si le NAS est éteint ou le lecteur déconnecté, les fichiers seront marqués en erreur.'
                : 'Make sure the network drive is mounted before starting a scan. The path should look like Z:\\MyNAS\\Backups\\. If the NAS is off or the drive disconnected, files will be marked as error.'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Disques externes' : 'External drives'}</strong> — {isFr
                ? 'Branchez votre disque dur externe et attendez qu\'il soit reconnu par Windows (lettre de lecteur visible) avant de lancer le scan.'
                : 'Plug in your external hard drive and wait for Windows to recognize it (drive letter visible) before starting the scan.'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Copier les chemins' : 'Copy paths'}</strong> — {isFr
                ? 'Vous pouvez copier un chemin depuis l\'Explorateur Windows (Shift + clic droit → "Copier en tant que chemin") et le coller directement dans les champs de Backcheck.'
                : 'You can copy a path from Windows Explorer (Shift + right-click → "Copy as path") and paste it directly into Backcheck fields.'}
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>{isFr ? 'Vérification régulière' : 'Regular checks'}</strong> — {isFr
                ? 'Lancez un scan après chaque backup pour vérifier que tout a été copié correctement. C\'est le moment où vous détectez les problèmes le plus facilement.'
                : 'Run a scan after every backup to verify everything was copied correctly. This is when you detect problems most easily.'}
            </li>
          </ul>
        </div>
      </div>

      {/* Section 9 : Raccourcis */}
      <div className="card">
        <div className="card-title">⌨️ {isFr ? 'Astuce rapide' : 'Quick tip'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.9 }}>
          <p>
            {isFr
              ? 'Pour copier le chemin d\'un dossier dans Windows : maintenez Shift, faites clic droit sur le dossier dans l\'Explorateur, puis choisissez "Copier en tant que chemin". Collez ensuite avec Ctrl+V dans Backcheck.'
              : 'To copy a folder path in Windows: hold Shift, right-click the folder in Explorer, then choose "Copy as path". Then paste with Ctrl+V in Backcheck.'}
          </p>
        </div>
      </div>
    </div>
  );
}
