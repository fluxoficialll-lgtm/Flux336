
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { ModalProvider } from './componentes/ComponentesDeInterface/ModalSystem';
import { GlobalTracker } from './componentes/ComponentesDeLayout/GlobalTracker';
import { DeepLinkHandler } from './componentes/ComponentesDeLayout/DeepLinkHandler';
import AppRoutes from './RotasDoFrontEnd/AppRoutes';
import { useAuthSync } from './hooks/useAuthSync';
import { GlobalErrorBoundary } from './componentes/ComponentesDeLayout/GlobalErrorBoundary';
import { configControl } from './ServiçosDoFrontend/ServiçoDeAdmin/ConfigControl';
import { hydrationManager } from './ServiçosDoFrontend/ServiçoDeSincronizacao/HydrationManager';

const Maintenance = lazy(() => import('./Paginas/Maintenance').then(m => ({ default: m.Maintenance })));

const LoadingFallback: React.FC = () => (
    <div className="h-screen w-full bg-[#0c0f14] flex flex-col items-center justify-center gap-4">
        <i className="fa-solid fa-circle-notch fa-spin text-[#00c2ff] text-2xl"></i>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[3px]">
            Carregando...
        </span>
    </div>
);

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isHydrated, setIsHydrated] = useState(hydrationManager.isFullyHydrated());

  useAuthSync();

  useEffect(() => {
    const unsub = hydrationManager.subscribe(setIsHydrated);
    
    const initializeApp = async () => {
      const bootTimeout = setTimeout(() => {
        if (!isReady) {
            console.warn("⏱️ [Boot] Timeout de segurança atingido. Forçando entrada...");
            setIsReady(true);
            setIsMaintenance(false);
        }
      }, 5000);

      try {
        const getParam = (key: string) => {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has(key)) return searchParams.get(key);
            
            const hashPart = window.location.hash.split('?')[1];
            if (hashPart) {
                const hashParams = new URLSearchParams(hashPart);
                return hashParams.get(key);
            }
            return null;
        };

        const forceOpen = getParam('ignoreMaintenance') === 'true' || getParam('force') === 'true';
        const config = await configControl.boot();
        const shouldShowMaintenance = config.maintenanceMode === true && !forceOpen;
        
        setIsMaintenance(shouldShowMaintenance);
      } catch (e) {
        console.error("Erro no boot do sistema:", e);
        setIsMaintenance(false);
      } finally {
        clearTimeout(bootTimeout);
        setIsReady(true);
        if (!localStorage.getItem('auth_token')) {
            setIsHydrated(true);
        }
      }
    };
    
    initializeApp();
    return () => unsub();
  }, []);

  if (!isReady || !isHydrated) {
    return <LoadingFallback />;
  }

  if (isMaintenance) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Maintenance />
        </Suspense>
    );
  }

  return (
    <GlobalErrorBoundary>
      <ModalProvider>
        <HashRouter>
          <GlobalTracker />
          <DeepLinkHandler />
          <AppRoutes />
        </HashRouter>
      </ModalProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
