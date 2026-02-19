
import React, { useEffect } from 'react';
import { logClientEvent } from '@/utils/logger';

declare const google: any;

interface LoginInitialCardProps {
    onSelectEmail: () => void;
    googleButtonId: string;
    loading: boolean;
    googleProcessing: boolean;
    initializeGoogleSignIn: () => void;
}

export const LoginInitialCard: React.FC<LoginInitialCardProps> = ({ 
    onSelectEmail, 
    googleButtonId, 
    loading, 
    googleProcessing,
    initializeGoogleSignIn
}) => {

    useEffect(() => {
        // Sempre tenta inicializar o botão do Google quando este card está visível
        initializeGoogleSignIn();
    }, [initializeGoogleSignIn]); // Dependência garante que a função seja estável

    return (
        <div className="w-full flex flex-col items-center animate-fade-in">
            <img src="/flux-logo.svg" alt="Flux Logo" className="h-12 mb-2" />
            <h1 className="text-3xl font-bold tracking-tighter">Bem-vindo</h1>
            <p className="text-white/60 text-center text-sm mb-8">Faça login para continuar</p>

            {/* Google Button Container */}
            <div id={googleButtonId} className={`w-full max-w-[280px] h-[44px] transition-opacity duration-300 ${googleProcessing ? 'opacity-50' : 'opacity-100'}`}></div>
            
            <div className="flex items-center w-full max-w-[280px] my-6">
                <div className="flex-grow h-px bg-white/10"></div>
                <span className="mx-4 text-xs text-white/40">OU</span>
                <div className="flex-grow h-px bg-white/10"></div>
            </div>

            <button 
                onClick={onSelectEmail}
                disabled={loading || googleProcessing}
                className="w-full max-w-[280px] h-11 bg-white/5 border border-white/10 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
                <i className="fa-regular fa-envelope"></i>
                Continuar com E-mail
            </button>
        </div>
    );
};
