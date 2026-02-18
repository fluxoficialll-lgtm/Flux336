
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { trackingService } from '../services/trackingService';
import { LoginInitialCard } from '../features/auth/components/LoginInitialCard';
import { LoginEmailCard } from '../features/auth/components/LoginEmailCard';
import { logClientEvent } from '../utils/logger';

declare const google: any;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [googleAuthProcessing, setGoogleAuthProcessing] = useState(false);
    const [error, setError] = useState('');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    
    const GOOGLE_BTN_ID = 'googleButtonDiv';

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
            logClientEvent('info', `✅ Frontend VITE_API_URL: ${apiUrl}`, { component: 'Login' });
        } else {
            logClientEvent('error', "❌ CRITICAL: VITE_API_URL not injected.", { component: 'Login' });
        }

        logClientEvent('info', 'User Story: Visitor landed on Login page.', { component: 'Login' });
        trackingService.captureUrlParams();
    }, [location]);

    const handleRedirect = useCallback((user: any, isNewUser: boolean = false) => {
        setGoogleAuthProcessing(false);
        const targetPath = isNewUser || (user && !user.isProfileCompleted) ? '/complete-profile' : '/feed';
        logClientEvent('info', `Redirecting user to ${targetPath}`, { component: 'Login', userId: user.id });
        
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
        logClientEvent('info', 'User Story: Google account selected. Validating...', { traceId });

        try {
            if (!response || !response.credential) throw new Error("Google credential not received.");
            const result = await authService.loginWithGoogle(response.credential, traceId);
            if (result && result.user) {
                handleRedirect(result.user, result.nextStep === '/complete-profile');
            }
        } catch (err: any) {
            logClientEvent('error', 'User Story: Google validation failed.', { traceId, error: err.message });
            setError(`Authentication failed. Please try again. Code: ${err.traceId || traceId}`);
            setGoogleAuthProcessing(false);
        }
    }, [handleRedirect]);

    // ** NOVA LÓGICA DE INICIALIZAÇÃO - Estável e encapsulada **
    const initializeGoogleSignIn = useCallback(() => {
        if (typeof google === 'undefined') {
            logClientEvent('error', "Google Identity Services library not loaded.", { component: 'Login' });
            return;
        }

        const renderGoogleButton = async () => {
            try {
                const googleClientId = await authService.getGoogleClientId();
                google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleCredentialResponse,
                    ux_mode: 'popup',
                });

                const googleButtonDiv = document.getElementById(GOOGLE_BTN_ID);
                if (googleButtonDiv) {
                    // Limpa o botão antigo antes de renderizar um novo
                    googleButtonDiv.innerHTML = ''; 
                    google.accounts.id.renderButton(
                        googleButtonDiv,
                        { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', shape: 'pill' }
                    );
                    logClientEvent('info', 'Google button has been rendered.', { component: 'Login' });
                }
            } catch (error: any) {
                logClientEvent('error', 'Google Sign-In initialization failed.', { errorMessage: error.message });
                setError("Could not load login options. Please refresh.");
            }
        };

        renderGoogleButton();

    }, [handleCredentialResponse]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setGoogleAuthProcessing(true);
        setError('');
        const traceId = crypto.randomUUID();
        logClientEvent('info', 'User Story: Email login attempt.', { traceId, email });
        try {
            const result = await authService.login(email, password, traceId);
            if (result && result.user) {
                handleRedirect(result.user, result.nextStep === '/complete-profile');
            }
        } catch (err: any) {
            logClientEvent('error', 'User Story: Email login failed.', { traceId, email, error: err.message });
            setError(`Invalid credentials. Code: ${err.traceId || traceId}`);
            setGoogleAuthProcessing(false);
        }
    };

    const handleShowEmailForm = () => setShowEmailForm(true);
    const handleBackToGoogle = () => setShowEmailForm(false);

    if (loading) return null;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white font-['Inter'] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00c2ff] rounded-full filter blur-[150px] opacity-20"></div>
            <div className="w-full max-w-[400px] mx-4 bg-white/5 backdrop-blur-2xl rounded-[32px] p-10 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center">
                
                {googleAuthProcessing && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-[32px] flex items-center justify-center z-50">
                        <i className="fa-solid fa-circle-notch fa-spin text-[#00c2ff] text-2xl"></i>
                    </div>
                )}

                {showEmailForm ? (
                    <LoginEmailCard 
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        onSubmit={handleEmailLogin} onBackToGoogle={handleBackToGoogle}
                        loading={googleAuthProcessing} error={error}
                    />
                ) : (
                    <LoginInitialCard 
                        onSelectEmail={handleShowEmailForm}
                        googleButtonId={GOOGLE_BTN_ID}
                        loading={loading} googleProcessing={googleAuthProcessing}
                        initializeGoogleSignIn={initializeGoogleSignIn} // Passando a função
                    />
                )}
                
                {error && !googleAuthProcessing && (
                     <p className="text-red-400 text-xs text-center mt-4 max-w-full break-words">{error}</p>
                )}
            </div>
        </div>
    );
};
