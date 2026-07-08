import React, { useEffect, useState } from 'react';
import TreeCensusApp from './tree_census_pro';
import { Share2 } from 'lucide-react';

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);

  // Registra Service Worker per PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrato:', registration);
        })
        .catch((error) => {
          console.log('❌ Errore Service Worker:', error);
        });
    }
  }, []);

  // Gestisci install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Controlla se è già installata
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    setInstallPrompt(null);
    setIsInstalled(true);
  };

  const shareApp = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tree Census Pro',
          text: 'App professionale per censimento alberi con foto, mappe e PDF',
          url: url
        });
      } catch (err) {
        console.log('Share cancellato');
      }
    } else {
      // Fallback: copia negli appunti
      navigator.clipboard.writeText(url);
      alert('Link copiato negli appunti!');
    }
  };

  return (
    <>
      {/* Install Banner */}
      {installPrompt && !isInstalled && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-600 text-white p-4 shadow-lg z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-bold">📱 Installa come App</p>
              <p className="text-sm opacity-90">Accedi direttamente dal tuo telefono senza browser</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-emerald-600 px-4 py-2 rounded font-bold hover:bg-emerald-50 transition"
              >
                Installa
              </button>
              <button
                onClick={() => setInstallPrompt(null)}
                className="bg-emerald-700 px-4 py-2 rounded hover:bg-emerald-800 transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App */}
      <TreeCensusApp />

      {/* Share Button - Fisso in basso a destra */}
      {isInstalled && (
        <button
          onClick={shareApp}
          className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition hover:scale-110 z-30"
          title="Condividi app con il tuo team"
        >
          <Share2 size={24} />
        </button>
      )}
    </>
  );
};

export default App;
