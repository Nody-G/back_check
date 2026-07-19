export type Locale = 'fr' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  fr: {
    app_title: 'Backcheck',
    nav_scan: 'Scanner',
    nav_history: 'Historique',
    nav_settings: 'Paramètres',
    nav_help: 'Aide',

    // Scan page
    scan_title: 'Vérifier un backup',
    scan_subtitle: 'Comparez un dossier source avec son backup pour détecter les différences',
    source_folder: 'Dossier source',
    backup_folder: 'Dossier backup',
    select_folder: 'Parcourir…',
    start_scan: 'Lancer le scan',
    scanning: 'Scan en cours…',
    scan_listing_source: '📂 Lecture du dossier source…',
    scan_listing_backup: '📂 Lecture du dossier backup…',
    scan_comparing: '🔍 Comparaison des fichiers…',
    scan_checksums: '🔐 Vérification des checksums…',
    scan_files_found: 'fichiers trouvés',
    scan_walking: 'Parcours des dossiers…',
    scan_progress_files: 'fichiers',
    scan_all: 'Scanner tous les projets',
    scan_single: 'Scanner un projet',

    // Results
    result_title: 'Résultat du scan',
    result_ok: 'Tous les fichiers sont synchronisés ✅',
    result_warning: 'Attention : des différences ont été détectées ⚠️',
    result_error: 'Erreurs détectées ❌',
    total_files: 'Fichiers total',
    identical: 'Identiques',
    missing_backup: 'Manquants (backup)',
    missing_source: 'Manquants (source)',
    modified_files: 'Modifiés',
    errors: 'Erreurs',
    duration: 'Durée',
    file: 'Fichier',
    status: 'Statut',
    source_size: 'Taille source',
    backup_size: 'Taille backup',
    checksum: 'Checksum',
    detail: 'Détail',
    ok: 'OK',
    missing_in_backup: 'Manquant',
    missing_in_source: 'Manquant (source)',
    modified: 'Modifié',
    error: 'Erreur',
    no_backup: 'Pas de backup',
    no_source: 'Pas de source',
    size_mismatch: 'Taille différente',
    checksum_mismatch: 'Checksum différent',

    // Export
    export_html: 'Exporter HTML',
    export_pdf: 'Exporter PDF',

    // History
    history_title: 'Historique des scans',
    history_subtitle: 'Consultez les résultats des scans précédents',
    scan_date: 'Date',
    scan_source: 'Source',
    scan_backup: 'Backup',
    scan_status: 'Statut',
    scan_files: 'Fichiers',
    view_details: 'Voir détails',
    delete: 'Supprimer',
    no_history: 'Aucun scan enregistré',
    confirm_delete: 'Supprimer ce scan ?',

    // Settings
    settings_title: 'Paramètres',
    language: 'Langue',
    french: 'Français',
    english: 'English',

    // Sync
    sync_backup: 'Synchroniser le backup',
    sync_confirm: 'Voulez-vous mettre à jour le backup ?\n\nLes fichiers manquants et modifiés seront copiés depuis la source.\nLes fichiers orphelins (présents dans le backup mais pas dans la source) seront supprimés.',
    sync_progress: 'Synchronisation en cours…',
    sync_copying: 'Copie en cours…',
    sync_deleting: 'Nettoyage en cours…',
    sync_done: 'Synchronisation terminée ✅',
    sync_copied: 'Fichiers copiés',
    sync_deleted: 'Fichiers supprimés',
    sync_errors: 'Erreurs de sync',
    sync_nothing: 'Rien à synchroniser — tout est à jour !',
    sync_warning_delete: 'Les fichiers orphelins dans le backup seront supprimés.',

    // Common
    cancel: 'Annuler',
    close: 'Fermer',
    back: 'Retour',
    loading: 'Chargement…',
    error_generic: 'Une erreur est survenue',
  },
  en: {
    app_title: 'Backcheck',
    nav_scan: 'Scan',
    nav_history: 'History',
    nav_settings: 'Settings',
    nav_help: 'Help',

    scan_title: 'Verify a backup',
    scan_subtitle: 'Compare a source folder with its backup to detect differences',
    source_folder: 'Source folder',
    backup_folder: 'Backup folder',
    select_folder: 'Browse…',
    start_scan: 'Start scan',
    scanning: 'Scanning…',
    scan_listing_source: '📂 Reading source folder…',
    scan_listing_backup: '📂 Reading backup folder…',
    scan_comparing: '🔍 Comparing files…',
    scan_checksums: '🔐 Verifying checksums…',
    scan_files_found: 'files found',
    scan_walking: 'Walking directories…',
    scan_progress_files: 'files',
    scan_all: 'Scan all projects',
    scan_single: 'Scan one project',

    result_title: 'Scan result',
    result_ok: 'All files are synchronized ✅',
    result_warning: 'Warning: differences detected ⚠️',
    result_error: 'Errors detected ❌',
    total_files: 'Total files',
    identical: 'Identical',
    missing_backup: 'Missing (backup)',
    missing_source: 'Missing (source)',
    modified_files: 'Modified',
    errors: 'Errors',
    duration: 'Duration',
    file: 'File',
    status: 'Status',
    source_size: 'Source size',
    backup_size: 'Backup size',
    checksum: 'Checksum',
    detail: 'Detail',
    ok: 'OK',
    missing_in_backup: 'Missing',
    missing_in_source: 'Missing (source)',
    modified: 'Modified',
    error: 'Error',
    no_backup: 'No backup',
    no_source: 'No source',
    size_mismatch: 'Different size',
    checksum_mismatch: 'Different checksum',

    export_html: 'Export HTML',
    export_pdf: 'Export PDF',

    history_title: 'Scan history',
    history_subtitle: 'View results from previous scans',
    scan_date: 'Date',
    scan_source: 'Source',
    scan_backup: 'Backup',
    scan_status: 'Status',
    scan_files: 'Files',
    view_details: 'View details',
    delete: 'Delete',
    no_history: 'No scans recorded',
    confirm_delete: 'Delete this scan?',

    settings_title: 'Settings',
    language: 'Language',
    french: 'Français',
    english: 'English',

    // Sync
    sync_backup: 'Sync backup',
    sync_confirm: 'Do you want to update the backup?\n\nMissing and modified files will be copied from the source.\nOrphan files (in backup but not in source) will be deleted.',
    sync_progress: 'Syncing…',
    sync_copying: 'Copying…',
    sync_deleting: 'Cleaning up…',
    sync_done: 'Sync complete ✅',
    sync_copied: 'Files copied',
    sync_deleted: 'Files deleted',
    sync_errors: 'Sync errors',
    sync_nothing: 'Nothing to sync — everything is up to date!',
    sync_warning_delete: 'Orphan files in the backup will be deleted.',

    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    loading: 'Loading…',
    error_generic: 'An error occurred',
  },
};

let currentLocale: Locale = (localStorage.getItem('backcheck-locale') as Locale) || 'fr';

export function t(key: string): string {
  return translations[currentLocale]?.[key] || translations['fr']?.[key] || key;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem('backcheck-locale', locale);
}
