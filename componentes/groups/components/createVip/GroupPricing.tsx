
import React from 'react';
import { CurrencyType } from '../../../../componentes/groups/CurrencySelectorModal';

interface GroupPricingProps {
    price: string;
    currency: CurrencyType;
    accessType: 'lifetime' | 'temporary' | 'one_time';
    accessConfig: any;
    selectedProviderId: string | null;
    handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setIsProviderModalOpen: (isOpen: boolean) => void;
    setIsAccessModalOpen: (isOpen: boolean) => void;
    setIsCurrencyModalOpen: (isOpen: boolean) => void;
    getProviderLabel: () => string;
    getAccessTypeLabel: () => string;
    getCurrencySymbol: () => string;
}

export const GroupPricing: React.FC<GroupPricingProps> = ({ 
    price, currency, accessType, accessConfig, selectedProviderId, 
    handlePriceChange, setIsProviderModalOpen, setIsAccessModalOpen, setIsCurrencyModalOpen,
    getProviderLabel, getAccessTypeLabel, getCurrencySymbol
}) => {
    return (
        <div className="price-group">
            <label>Venda e Acesso</label>

            <div className="selector-trigger" onClick={() => setIsProviderModalOpen(true)}>
                <div className="flex flex-col text-left">
                    <span className="label">Escolher provedor:</span>
                    <span className="value">
                        <i className="fa-solid fa-wallet"></i>
                        {getProviderLabel()}
                    </span>
                </div>
                <i className="fa-solid fa-chevron-right text-[#FFD700]"></i>
            </div>
            
            <div className="selector-trigger" onClick={() => setIsAccessModalOpen(true)}>
                <div className="flex flex-col text-left">
                    <span className="label">Tipo de acesso:</span>
                    <span className="value">
                        <i className={`fa-solid ${accessType === 'lifetime' ? 'fa-infinity' : accessType === 'temporary' ? 'fa-calendar-days' : 'fa-ticket'}`}></i>
                        {getAccessTypeLabel()}
                    </span>
                </div>
                <i className="fa-solid fa-chevron-right text-[#FFD700]"></i>
            </div>

            <div className="selector-trigger" onClick={() => setIsCurrencyModalOpen(true)}>
                <div className="flex flex-col text-left">
                    <span className="label">Moeda para cobrança:</span>
                    <span className="value">
                        <span className="curr-sym">{getCurrencySymbol()}</span>
                        {currency}
                    </span>
                </div>
                <i className="fa-solid fa-chevron-right text-[#FFD700]"></i>
            </div>

            <div className="price-input-container">
                <span>{getCurrencySymbol()}</span>
                <input type="text" value={price} onChange={handlePriceChange} placeholder="0,00" required />
            </div>
        </div>
    );
};

