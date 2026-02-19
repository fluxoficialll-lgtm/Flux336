
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProviderCredentialsModal } from '../componentes/ComponentesFinanceiros/ProviderCredentialsModal';
import ProviderSettingsModal from '../componentes/ComponentesFinanceiros/ProviderSettingsModal';
import { credentialsService } from '../ServiçosDoFrontend/ServiçoDeSeguranca/credentialsService';
import './ProviderConfig.css';
import { providers } from '../ServiçosDoFrontend/ServiçoDePagamentos/providerData';
import { ProviderListItem } from '../componentes/ComponentesFinanceiros/ProviderListItem';

export const ProviderConfig: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const hasInitialized = useRef(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectedProviders = async () => {
        try {
            console.log('Buscando provedores conectados...');
            const providers = await credentialsService.getConnectedProviders();
            console.log('Provedores recebidos:', providers);
            const connected = new Set<string>(providers);
            setConnectedProviders(connected);

            if (!hasInitialized.current) {
                if (connected.size > 0) {
                    setExpanded(Array.from(connected)[0]);
                } else {
                    setExpanded('syncpay');
                }
                hasInitialized.current = true;
            }
        } catch (error) {
            console.error("Falha ao carregar configuração dos provedores:", error);
        }
    };

    fetchConnectedProviders();
  }, []);

  const handleStatusChange = (providerId: string, connected: boolean) => {
      setConnectedProviders(prev => {
          const next = new Set(prev);
          if (connected) next.add(providerId);
          else next.delete(providerId);
          
          if (!connected && expanded === providerId) {
            setExpanded(null);
          }
          return next;
      });
  };

  const handleConnect = async (credentials: any) => {
    if (!selectedProvider) return;
    try {
        await credentialsService.saveCredentials(selectedProvider, credentials);
        handleStatusChange(selectedProvider, true);
    } catch (error) {
        console.error(`Erro ao conectar ${selectedProvider}:`, error);
        throw error;
    }
  };

  const toggleProvider = (id: string) => {
      setExpanded(prev => prev === id ? null : id);
  };

  const handleBack = () => {
      if (window.history.state && window.history.state.idx > 0) navigate(-1);
      else navigate('/financial');
  };
  
  const openSettingsModal = (providerId: string) => {
      setSelectedProvider(providerId);
      setIsSettingsModalOpen(true);
  };

  const handleManageCredentials = () => {
      if (!selectedProvider) return;
      setIsSettingsModalOpen(false);
      setIsCredentialsModalOpen(true);
  };

  const handleDisconnect = async () => {
    if (!selectedProvider) return;
    try {
        await credentialsService.disconnectProvider(selectedProvider);
        handleStatusChange(selectedProvider, false);
    } catch (error) {
        console.error(`Erro ao desconectar ${selectedProvider}:`, error);
    } finally {
        setIsSettingsModalOpen(false);
    }
  };

  const selectedProviderData = useMemo(() => {
    if (!selectedProvider) return null;
    return providers.find(p => p.id === selectedProvider);
  }, [selectedProvider]);

  const connectedList = providers.filter(p => connectedProviders.has(p.id));
  const disconnectedList = providers.filter(p => !connectedProviders.has(p.id));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-x-hidden">
      
      <header>
        <button onClick={handleBack}><i className="fa-solid fa-arrow-left"></i></button>
        <h1>Provedores de Pagamento</h1>
      </header>
      <main className="no-scrollbar">
        {connectedList.length > 0 && (
            <>
                <div className="section-header"><span></span> Conectados <span></span></div>
                {connectedList.map(provider => (
                    <ProviderListItem 
                        key={provider.id}
                        provider={provider}
                        isExpanded={expanded === provider.id}
                        isConnected={connectedProviders.has(provider.id)}
                        onToggle={toggleProvider}
                        onOpenSettings={openSettingsModal}
                    />
                ))}
            </>
        )}
        <div className="section-header"><span></span> Disponíveis <span></span></div>
        {disconnectedList.map(provider => (
            <ProviderListItem 
                key={provider.id}
                provider={provider}
                isExpanded={expanded === provider.id}
                isConnected={connectedProviders.has(provider.id)}
                onToggle={toggleProvider}
                onOpenSettings={openSettingsModal}
            />
        ))}
        
        <div className="mt-12 p-6 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl text-center opacity-30">
            <i className="fa-solid fa-shield-halved text-2xl mb-3"></i>
            <p className="text-[10px] uppercase font-black tracking-[2px] leading-relaxed">
                Suas credenciais são criptografadas e enviadas via túnel seguro. O Flux não armazena chaves privadas em texto aberto.
            </p>
        </div>
      </main>
      <ProviderSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} providerName={selectedProviderData?.name || ''} isConnected={selectedProvider ? connectedProviders.has(selectedProvider) : false} onManageCredentials={handleManageCredentials} onDisconnect={handleDisconnect} />
      <ProviderCredentialsModal isOpen={isCredentialsModalOpen} onClose={() => setIsCredentialsModalOpen(false)} providerId={selectedProvider} providerName={selectedProviderData?.name || ''} onConnect={handleConnect} />
    </div>
  );
};
