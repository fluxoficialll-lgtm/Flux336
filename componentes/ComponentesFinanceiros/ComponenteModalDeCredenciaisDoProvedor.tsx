
import React, { useState } from 'react';

interface CredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    providerId: string | null;
    providerName: string;
    onConnect: (credentials: any) => Promise<void>;
}

export const ProviderCredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose, providerId, providerName, onConnect }) => {
    const [credentials, setCredentials] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await onConnect(credentials);
            onClose();
        } catch (err: any) {
            setError(err.message || "Falha ao conectar. Verifique suas credenciais.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderFields = () => {
        switch (providerId) {
            case 'syncpay':
                return (
                    <>
                        <div className="input-group">
                            <label htmlFor="clientId">Client ID</label>
                            <input type="text" id="clientId" name="clientId" onChange={handleCredentialChange} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="clientSecret">Client Secret</label>
                            <input type="password" id="clientSecret" name="clientSecret" onChange={handleCredentialChange} />
                        </div>
                    </>
                );
            case 'stripe':
                return (
                    <div className="input-group">
                        <label htmlFor="secretKey">Secret Key</label>
                        <input type="password" id="secretKey" name="secretKey" onChange={handleCredentialChange} />
                    </div>
                );
            case 'paypal':
                return (
                    <>
                        <div className="input-group">
                            <label htmlFor="clientId">Client ID</label>
                            <input type="text" id="clientId" name="clientId" onChange={handleCredentialChange} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="clientSecret">Client Secret</label>
                            <input type="password" id="clientSecret" name="clientSecret" onChange={handleCredentialChange} />
                        </div>
                    </>
                );
            default:
                return <p>Provedor não suportado.</p>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Conectar com {providerName}</h2>
                <form onSubmit={handleSubmit}>
                    {renderFields()}
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="connect-button" disabled={isLoading}>
                        {isLoading ? 'Conectando...' : 'Conectar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
