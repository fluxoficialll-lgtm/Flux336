
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateVipGroupForm } from '@/componentes/groups/hooks/useCreateVipGroupForm';
import { CreateVipGroupHeader } from '@/componentes/groups/componentes/createVip/CreateVipGroupHeader';
import { GroupBasicInfo } from '@/componentes/groups/componentes/createVip/GroupBasicInfo';
import { VipDoorGallery } from '@/componentes/groups/componentes/createVip/VipDoorGallery';
import { GroupPricing } from '@/componentes/groups/componentes/createVip/GroupPricing';
import { GroupMarketing } from '@/componentes/groups/componentes/createVip/GroupMarketing';
import { PixelSettingsModal } from '@/componentes/ComponentesDeGrupos/PixelSettingsModal';
import { AccessTypeModal } from '@/componentes/ComponentesDeGrupos/AccessTypeModal';
import { CurrencySelectorModal } from '@/componentes/ComponentesDeGrupos/CurrencySelectorModal';
import { ProviderSelectorModal } from '@/componentes/ComponentesDeGrupos/ProviderSelectorModal';
import { ImageCropModal } from '@/componentes/ComponentesDeInterface/ImageCropModal';
import { UploadProgressCard } from '@/componentes/groups/componentes/platform/UploadProgressCard';

export const CreateVipGroup: React.FC = () => {
  const navigate = useNavigate();
  const {
    groupName, setGroupName,
    description, setDescription,
    coverImage, handleCoverChange, rawImage,
    vipMediaItems, vipDoorText, setVipDoorText, vipButtonText, setVipButtonText, 
    handleVipMediaChange, moveVipMediaItem, removeMediaItem,
    price, currency, accessType, accessConfig, selectedProviderId, handlePriceChange,
    pixelId, handleSavePixel,
    isCreating, isUploading, uploadProgress, uploadCurrent, uploadTotal, hasProvider,
    isProviderModalOpen, setIsProviderModalOpen, isPixelModalOpen, setIsPixelModalOpen, 
    isAccessModalOpen, setIsAccessModalOpen, isCurrencyModalOpen, setIsCurrencyModalOpen, 
    isCropOpen, setIsCropOpen, handleCroppedImage,
    handleProviderSelect, handleSubmit, handleBack, allowedCurrencies,
    setAccessType, setAccessConfig, setCurrency
  } = useCreateVipGroupForm();

  const getCurrencySymbol = () => {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return 'R$';
  };

  const getAccessTypeLabel = () => {
    if (accessType === 'lifetime') return 'Vitalício';
    if (accessType === 'temporary' && accessConfig) return `Renova a cada ${accessConfig.interval} dias (Máx 2x)`;
    if (accessType === 'one_time' && accessConfig) return `Expira em ${accessConfig.days}d ${accessConfig.hours}h`;
    return 'Escolher';
  };

  const getProviderLabel = () => {
    if (!selectedProviderId) return 'Escolher';
    if (selectedProviderId === 'syncpay') return 'SyncPay (Pix)';
    if (selectedProviderId === 'stripe') return 'Stripe';
    if (selectedProviderId === 'paypal') return 'PayPal';
    return selectedProviderId.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-x-hidden">
      <style>{`
        /* Seus estilos permanecem aqui, inalterados */
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
        header { display:flex; align-items:center; justify-content:space-between; padding:16px 32px; background: #0c0f14; position:fixed; width:100%; z-index:10; border-bottom:1px solid rgba(255,255,255,0.1); top: 0; left:0; height: 80px; }
        header button { background:none; border:none; color:#00c2ff; font-size:18px; cursor:pointer; transition:0.3s; }
        header button:hover { color:#fff; }
        main { flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; width:100%; padding-top: 100px; padding-bottom: 150px; }
        #groupCreationForm { width:100%; max-width:500px; padding:0 20px; display: flex; flex-direction: column; gap: 20px; }
        h1 { font-size: 24px; text-align: center; margin-bottom: 20px; background: -webkit-linear-gradient(145deg, #FFD700, #B8860B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; }
        .cover-upload-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 10px; }
        .cover-preview { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #FFD700; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(255, 215, 0, 0.2); }
        .cover-preview:hover { border-color: #fff; box-shadow: 0 0 25px rgba(255, 215, 0, 0.4); }
        .cover-preview img { width: 100%; height: 100%; object-fit: cover; }
        .cover-icon { font-size: 40px; color: rgba(255,255,255,0.3); }
        .cover-label { margin-top: 10px; font-size: 14px; color: #FFD700; cursor: pointer; font-weight: 600; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { font-size: 13px; color: #FFD700; margin-bottom: 8px; font-weight: 600; }
        .form-group input, .form-group textarea { background: #1e2531; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; color: #fff; padding: 12px; font-size: 16px; transition: border-color 0.3s; }
        .form-group input:focus, .form-group textarea:focus { border-color: #FFD700; outline: none; box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
        .form-group textarea { resize: vertical; min-height: 100px; }
        .vip-door-section { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 10px; }
        .section-title { font-size: 16px; color: #FFD700; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .media-preview-item { width: 80px; height: 100px; flex-shrink: 0; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid rgba(255, 215, 0, 0.2); background: #000; }
        .media-preview-item img, .media-preview-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-controls-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 6px; opacity: 0; transition: 0.2s; }
        .media-preview-item:hover .media-controls-overlay { opacity: 1; }
        .reorder-btn { width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 9px; }
        .reorder-btn:hover { background: #00c2ff; color: #000; border-color: #00c2ff; }
        .reorder-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .remove-media-btn-new { width: 22px; height: 22px; border-radius: 6px; background: rgba(255, 77, 77, 0.2); border: 1px solid rgba(255, 77, 77, 0.4); color: #ff4d4d; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 9px; }
        .remove-media-btn-new:hover { background: #ff4d4d; color: #fff; }
        .add-media-btn { width: 80px; height: 100px; flex-shrink: 0; border-radius: 12px; border: 1px dashed #FFD700; background: rgba(255, 215, 0, 0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #FFD700; cursor: pointer; gap: 5px; }
        .add-media-btn:hover { background: rgba(255, 215, 0, 0.1); }
        .add-media-btn span { font-size: 10px; font-weight: 600; text-align: center; }
        .common-button { background: #FFD700; border: none; border-radius: 8px; color: #000; padding: 16px 20px; font-size: 18px; font-weight: 700; cursor: pointer; transition: background 0.3s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3); margin-top: 20px; }
        .common-button:hover { background: #e6c200; }
        .common-button:active { transform: scale(0.99); }
        .common-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .price-group { display: flex; flex-direction: column; gap: 10px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
        .price-group label { font-size: 16px; color: #FFD700; font-weight: 700; }
        .price-input-container { display: flex; align-items: center; background: #1e2531; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; overflow: hidden; margin-bottom: 5px; }
        .price-input-container span { padding: 12px; background: #28303f; color: #aaa; font-size: 16px; font-weight: 700; min-width: 50px; text-align: center; }
        .price-input-container input { flex-grow: 1; border: none; background: none; padding: 12px; text-align: right; color: #fff; font-weight: 700; }
        .selector-trigger { width: 100%; background: #1e2531; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.3s; margin-bottom: 5px; }
        .selector-trigger:hover { border-color: #FFD700; background: rgba(255, 215, 0, 0.05); }
        .selector-trigger .label { font-size: 13px; color: #888; font-weight: 500; }
        .selector-trigger .value { font-size: 14px; color: #fff; font-weight: 700; display: flex; align-items: center; gap: 10px; text-align: right; }
        .selector-trigger .value span.curr-sym { width: 32px; text-align: center; color: #FFD700; font-weight: 900; }
        .add-pixel-btn { width: 100%; padding: 14px; background: rgba(255, 255, 255, 0.05); border: 1px dashed #FFD700; border-radius: 12px; color: #FFD700; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .add-pixel-btn:hover { background: rgba(255, 215, 0, 0.1); }
      `}</style>

      <CreateVipGroupHeader onBack={handleBack} />

      <main>
        <form id="groupCreationForm" onSubmit={handleSubmit}>
            <h1>Novo Grupo VIP</h1>
            
            {!hasProvider && (
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#fef08a' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{marginRight:'8px'}}></i>
                    Nenhum provedor conectado. <button type="button" onClick={() => navigate('/financial/providers')} style={{textDecoration:'underline', fontWeight:'bold', background:'none', border:'none', color:'inherit', cursor:'pointer'}}>Conectar agora</button>
                </div>
            )}

            <GroupBasicInfo 
                groupName={groupName}
                setGroupName={setGroupName}
                description={description}
                setDescription={setDescription}
                coverImage={coverImage}
                handleCoverChange={handleCoverChange}
            />

            <VipDoorGallery 
                vipMediaItems={vipMediaItems}
                vipDoorText={vipDoorText}
                setVipDoorText={setVipDoorText}
                vipButtonText={vipButtonText}
                setVipButtonText={setVipButtonText}
                handleVipMediaChange={handleVipMediaChange}
                moveVipMediaItem={moveVipMediaItem}
                removeMediaItem={removeMediaItem}
            />
            
            <GroupPricing 
                price={price}
                currency={currency}
                accessType={accessType}
                accessConfig={accessConfig}
                selectedProviderId={selectedProviderId}
                handlePriceChange={handlePriceChange}
                setIsProviderModalOpen={setIsProviderModalOpen}
                setIsAccessModalOpen={setIsAccessModalOpen}
                setIsCurrencyModalOpen={setIsCurrencyModalOpen}
                getProviderLabel={getProviderLabel}
                getAccessTypeLabel={getAccessTypeLabel}
                getCurrencySymbol={getCurrencySymbol}
            />

            <GroupMarketing 
                pixelId={pixelId}
                setIsPixelModalOpen={setIsPixelModalOpen}
            />

            <button type="submit" className="common-button" disabled={isCreating || isUploading}>
                {isCreating || isUploading ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : "Criar Grupo"}
            </button>
        </form>

        <UploadProgressCard 
            progress={uploadProgress}
            current={uploadCurrent}
            total={uploadTotal}
            isVisible={isUploading}
        />
      </main>

      <ProviderSelectorModal 
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        selectedProviderId={selectedProviderId}
        onSelect={handleProviderSelect}
      />

      <PixelSettingsModal 
        isOpen={isPixelModalOpen}
        onClose={() => setIsPixelModalOpen(false)}
        initialData={{ metaId: pixelId, metaToken: '' }}
        onSave={(platform, data) => handleSavePixel(data)}
      />

      <AccessTypeModal 
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        currentType={accessType}
        onSelect={(type, config) => {
            setAccessType(type);
            setAccessConfig(config);
        }}
      />

      <CurrencySelectorModal 
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentCurrency={currency}
        onSelect={(curr) => setCurrency(curr)}
        allowedCurrencies={allowedCurrencies}
      />

      <ImageCropModal 
        isOpen={isCropOpen}
        imageSrc={rawImage}
        onClose={() => setIsCropOpen(false)}
        onSave={handleCroppedImage}
      />
    </div>
  );
};
