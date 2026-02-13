
import React from 'react';

interface VipDoorGalleryProps {
    vipMediaItems: { url: string; type: 'image' | 'video'; }[];
    vipDoorText: string;
    setVipDoorText: (text: string) => void;
    vipButtonText: string;
    setVipButtonText: (text: string) => void;
    handleVipMediaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    moveVipMediaItem: (index: number, direction: 'left' | 'right') => void;
    removeMediaItem: (index: number) => void;
}

export const VipDoorGallery: React.FC<VipDoorGalleryProps> = ({ 
    vipMediaItems, vipDoorText, setVipDoorText, vipButtonText, setVipButtonText, 
    handleVipMediaChange, moveVipMediaItem, removeMediaItem 
}) => {
    return (
        <div className="vip-door-section">
            <div className="section-title"><i className="fa-solid fa-door-open"></i> Galeria da Porta VIP</div>
            <div className="flex flex-wrap gap-2.5 mb-4">
                {vipMediaItems.map((item, idx) => (
                    <div key={idx} className="media-preview-item animate-fade-in">
                        {item.type === 'video' ? <video src={item.url} /> : <img src={item.url} alt={`Preview ${idx}`} />}
                        
                        <div className="media-controls-overlay">
                            <div className="flex gap-1">
                                <button 
                                    type="button"
                                    onClick={() => moveVipMediaItem(idx, 'left')}
                                    disabled={idx === 0}
                                    className="reorder-btn"
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => moveVipMediaItem(idx, 'right')}
                                    disabled={idx === vipMediaItems.length - 1}
                                    className="reorder-btn"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                            <button type="button" className="remove-media-btn-new" onClick={() => removeMediaItem(idx)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>

                        <div className="absolute bottom-1 left-1 bg-black/60 text-[7px] font-black text-white px-1 py-0.5 rounded border border-white/5">
                            #{idx + 1}
                        </div>
                    </div>
                ))}
                {vipMediaItems.length < 10 && (
                    <label htmlFor="vipMediaInput" className="add-media-btn">
                        <i className="fa-solid fa-plus"></i>
                        <span>Adicionar</span>
                    </label>
                )}
                <input type="file" id="vipMediaInput" accept="image/*,video/*" multiple style={{display:'none'}} onChange={handleVipMediaChange} />
            </div>

            <div className="form-group">
                <label htmlFor="vipCopyright">Texto de Venda</label>
                <textarea id="vipCopyright" value={vipDoorText} onChange={(e) => setVipDoorText(e.target.value)} placeholder="Copy persuasiva..."></textarea>
            </div>

            <div className="form-group">
                <label htmlFor="vipButtonText">Texto do Botão (Opcional)</label>
                <input type="text" id="vipButtonText" value={vipButtonText} onChange={(e) => setVipButtonText(e.target.value)} placeholder="Ex: Assinar (Padrão: COMPRAR AGORA)" maxLength={20} />
            </div>
        </div>
    );
};
