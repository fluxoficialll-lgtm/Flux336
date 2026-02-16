
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { trackingService } from '../services/trackingService';
import { API_BASE } from '../apiConfig';
import { LoginInitialCard } from '../features/auth/components/LoginInitialCard';
import { LoginEmailCard } from '../features/auth/components/LoginEmailCard';

declare const google: any;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [googleAuthProcessing, setGoogleAuthProcessing] = useState(false);
    const [error, setError] = useState('');
    
    // State for Email/Password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    
    const buttonRendered = React.useRef(false);
    const GOOGLE_BTN_ID = 'googleButtonDiv';

    useEffect(() => {
        trackingService.captureUrlParams();
    }, [location]);

    const handleRedirect = useCallback((user: any, isNewUser: boolean = false) => {
        setGoogleAuthProcessing(false);
        const targetPath = isNewUser || (user && !user.isProfileCompleted) ? '/complete-profile' : '/feed';
        const pendingRedirect = sessionStorage.getItem('redirect_after_login') || (location.state as any)?.from?.pathname;
        
        if (pendingRedirect && pendingRedirect !== '/' && !pendingRedirect.includes('login')) {
            sessionStorage.removeItem('redirect_after_login');
            navigate(pendingRedirect, { replace: true });
        } else {
            navigate(targetPath, { replace: true });
        }
    }, [navigate, location]);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user && authService.isAuthenticated()) {
            handleRedirect(user);
        } else {
            setLoading(false);
        }
    }, [handleRedirect]);

    const handleCredentialResponse = useCallback(async (response: any) => {
        setGoogleAuthProcessing(true);
        setError('');
        const traceId = crypto.randomUUID();
        
        try {
            if (!response || !response.credential) throw new Error("Login falhou.");
            const result = await authService.loginWithGoogle(response.credential, traceId);
            if (result && result.user) {
                const isNew = result.nextStep === '/complete-profile' || !result.user.isProfileCompleted;
                handleRedirect(result.user, isNew);
            }
        } catch (err: any) {
            const displayError = `Falha na autenticação. Se o problema persistir, contate o suporte. Código de rastreamento: ${err.traceId || traceId}`;
            setError(displayError);
            setGoogleAuthProcessing(false);
        }
    }, [handleRedirect]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || googleAuthProcessing) return;
        setGoogleAuthProcessing(true);
        setError('');
        const traceId = crypto.randomUUID();
        
        try {
            const result = await authService.login(email, password, traceId);
            if (result && result.user) {
                const isNew = result.nextStep === '/complete-profile' || !result.user.isProfileCompleted;
                handleRedirect(result.user, isNew);
            }
        } catch (err: any) {
            const displayError = `Credenciais inválidas. Se o problema persistir, contate o suporte. Código de rastreamento: ${err.traceId || traceId}`;
            setError(displayError);
            setGoogleAuthProcessing(false);
        }
    };

    // Google Init logic
    useEffect(() => {
        // ... (o restante da lógica de inicialização do Google permanece o mesmo)
    }, [showEmailForm, handleCredentialResponse]);

    if (loading) return null;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white font-['Inter'] relative overflow-hidden">
            {/* ... (o restante do JSX permanece o mesmo) ... */}
            <div className="w-full max-w-[400px] mx-4 bg-white/5 backdrop-blur-2xl rounded-[32px] p-10 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center">
                {showEmailForm ? (
                    <LoginEmailCard 
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        onSubmit={handleEmailLogin}
                        onBackToGoogle={() => setShowEmailForm(false)}
                        loading={googleAuthProcessing}
                        error={error}
                    />
                ) : (
                    <LoginInitialCard 
                        onSelectEmail={() => setShowEmailForm(true)}
                        googleButtonId={GOOGLE_BTN_ID}
                        loading={loading}
                        googleProcessing={googleAuthProcessing}
                    />
                )}
                
                {googleAuthProcessing && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-[32px] flex items-center justify-center z-50">
                        <i className="fa-solid fa-circle-notch fa-spin text-[#00c2ff] text-2xl"></i>
                    </div>
                )}
            </div>
        </div>
    );
};
