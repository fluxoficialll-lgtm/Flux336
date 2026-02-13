
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProviderCredentialsModal } from '../components/financial/ProviderCredentialsModal';
import ProviderSettingsModal from '../components/financial/ProviderSettingsModal';
import { credentialsService } from '../services/credentialsService.ts';

interface ProviderData {
    id: string;
    name: string;
    icon: string;
    isPrimary?: boolean;
    status: 'active' | 'coming_soon';
    methods: { type: 'pix' | 'card'; label: string }[];
}

export const ProviderConfig: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const hasInitialized = useRef(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providers: ProviderData[] = useMemo(() => [
      { id: 'syncpay', name: 'SyncPay (Oficial)', icon: 'fa-bolt', isPrimary: true, status: 'active', methods: [{ type: 'pix', label: 'PIX' }] },
      { id: 'stripe', name: 'Stripe', icon: 'fa-brands fa-stripe', status: 'active', methods: [{ type: 'card', label: 'Cartão' }] },
      { id: 'paypal', name: 'PayPal', icon: 'fa-brands fa-paypal', status: 'active', methods: [{ type: 'pix', label: 'PIX' }, { type: 'card', label: 'Cartão' }] },
      { id: 'picpay', name: 'PicPay', icon: 'fa-qrcode', status: 'coming_soon', methods: [{ type: 'pix', label: 'PIX' }, { type: 'card', label: 'Cartão' }] }
  ], []);

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

  const selectedProviderData = useMemo(() => providers.find(p => p.id === selectedProvider), [selectedProvider, providers]);

  const connectedList = providers.filter(p => connectedProviders.has(p.id));
  const disconnectedList = providers.filter(p => !connectedProviders.has(p.id));

  const renderProvider = (provider: ProviderData) => {
    const isSoon = provider.status === 'coming_soon';
    const isConnected = connectedProviders.has(provider.id);

    return (
        <div key={provider.id} className={`provider-card ${provider.isPrimary ? 'primary' : ''} ${isConnected ? 'connected' : ''}`} style={{ opacity: isSoon ? 0.6 : 1 }}>
            <div className="provider-header">
                <div className="provider-info" onClick={() => !isSoon && toggleProvider(provider.id)}>
                    <div className="provider-icon" style={{ filter: isSoon ? 'grayscale(100%)' : 'none' }}><i className={`fa-solid ${provider.icon}`}></i></div>
                    <div className="provider-name">
                        <div className="flex items-center gap-2">
                            {provider.name}
                            {isConnected && <i className="fa-solid fa-circle-check text-[#00ff82] text-xs"></i>}
                        </div>
                        <div className="method-indicators">
                            {provider.methods.map((m, i) => (
                                <div className="method-item" key={i}>
                                    <div className={`method-dot ${isConnected ? 'active' : ''}`}></div>
                                    {m.label}
                                </div>
                            ))}
                        </div>
                        {isSoon && <span className="badge-soon">Em Breve</span>}
                    </div>
                </div>
                <div className="flex items-center">
                    <button onClick={() => openSettingsModal(provider.id)} className="ml-4 text-gray-400 hover:text-white"><i className="fa-solid fa-ellipsis-v"></i></button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-x-hidden">
      <style>{`
        header { display:flex; align-items:center; padding:16px 24px; background: #0c0f14; position:fixed; width:100%; top:0; z-index:10; border-bottom:1px solid rgba(255,255,255,0.1); height: 65px; }
        header button { background:none; border:none; color:#00c2ff; font-size:24px; cursor:pointer; padding-right: 15px; }
        header h1 { font-size:18px; font-weight:700; color:#fff; }
        main { padding: 90px 20px 40px 20px; max-width: 600px; margin: 0 auto; width: 100%; }
        .section-header { font-size: 10px; font-weight: 900; color: #555; text-transform: uppercase; letter-spacing: 2px; margin: 30px 0 15px 5px; display: flex; align-items: center; gap: 10px; }
        .section-header span { flex-grow: 1; height: 1px; background: rgba(255,255,255,0.05); }
        .provider-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; margin-bottom: 12px; overflow: hidden; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .provider-card.primary { border-color: rgba(0, 194, 255, 0.3); background: rgba(0, 194, 255, 0.02); }
        .provider-card.connected { border-color: rgba(0, 255, 130, 0.2); }
        .provider-header { display: flex; align-items: center; justify-content: space-between; padding: 20px; cursor: pointer; transition: 0.2s; }
        .provider-header:hover { background: rgba(255,255,255,0.03); }
        .provider-info { display: flex; align-items: center; gap: 15px; flex-grow: 1; }
        .provider-icon { width: 44px; height: 44px; border-radius: 12px; background: #1a1e26; color: #00c2ff; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .provider-name { font-size: 15px; font-weight: 800; color: #fff; display: flex; flex-direction: column; }
        .method-indicators { display: flex; gap: 12px; margin-top: 6px; }
        .method-item { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; }
        .method-dot { width: 6px; height: 6px; border-radius: 50%; background: #333; }
        .method-dot.active { background: #00ff82; box-shadow: 0 0 8px rgba(0, 255, 130, 0.4); }
        .arrow-icon { color: #555; transition: 0.3s; font-size: 14px; }
        .arrow-icon.expanded { transform: rotate(180deg); color: #00c2ff; }
        .provider-body { padding: 5px 20px 25px 20px; border-top: 1px solid rgba(255,255,255,0.03); animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .badge-soon { background: rgba(255,255,255,0.05); color: #444; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 900; margin-top: 5px; align-self: flex-start; text-transform: uppercase; }
        .disconnect-btn { width: 100%; padding: 12px; background: rgba(255, 77, 77, 0.05); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); border-radius: 12px; font-weight: 800; font-size: 12px; cursor: pointer; transition: 0.3s; text-transform: uppercase; }
        .disconnect-btn:hover { background: rgba(255, 77, 77, 0.15); border-color: #ff4d4d; }
      `}</style>
      <header>
        <button onClick={handleBack}><i className="fa-solid fa-arrow-left"></i></button>
        <h1>Provedores de Pagamento</h1>
      </header>
      <main className="no-scrollbar">
        {connectedList.length > 0 && (
            <>
                <div className="section-header"><span></span> Conectados <span></span></div>
                {connectedList.map(renderProvider)}
            </>
        )}
        <div className="section-header"><span></span> Disponíveis <span></span></div>
        {disconnectedList.map(renderProvider)}
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
