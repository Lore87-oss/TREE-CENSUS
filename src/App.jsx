import React, { useEffect } from 'react';
import TreeCensusApp from './tree_census_pro';

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registrato:', registration.scope);
          })
          .catch((error) => {
            console.log('Errore registrazione Service Worker:', error);
          });
      });
    }
  }, []);

  return <TreeCensusApp />;
}

export default App;
