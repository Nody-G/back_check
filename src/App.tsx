import { useState, useCallback, useEffect } from 'react';
import { t, getLocale, setLocale, Locale } from './i18n';
import Sidebar from './components/Sidebar';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

type Page = 'scan' | 'history' | 'settings' | 'help';

export default function App() {
  const [page, setPage] = useState<Page>('scan');
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  // Listen for navigation commands from main process (for screenshots)
  useEffect(() => {
    if (window.backcheck?.onNavigate) {
      window.backcheck.onNavigate((route: string) => {
        setPage(route as Page);
      });
    }
  }, []);

  const handleLocaleChange = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'scan':
        return <ScanPage locale={locale} />;
      case 'history':
        return <HistoryPage locale={locale} onOpenScan={(id) => {}} />;
      case 'settings':
        return <SettingsPage locale={locale} onLocaleChange={handleLocaleChange} />;
      case 'help':
        return <HelpPage locale={locale} />;
    }
  };

  return (
    <>
      <Sidebar currentPage={page} onNavigate={setPage} locale={locale} />
      <div className="main-content">
        {renderPage()}
      </div>
    </>
  );
}
