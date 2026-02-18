
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
    
    const buttonRendered = React.useRef(false);
    const GOOGLE_BTN_ID = 'googleButtonDiv';

    useEffect(() => {
        logClientEvent('info', 'História de Usuário: Visitante acessou a página de Login do Flux.', { component: 'Login' });
        trackingService.captureUrlParams();
    }, [location]);

    const handleRedirect = useCallback((user: any, isNewUser: boolean = false) => {
        setGoogleAuthProcessing(false);
        const targetPath = isNewUser || (user && !user.isProfileCompleted) ? '/complete-profile' : '/feed';
        const pendingRedirect = sessionStorage.getItem('redirect_after_login') || (location.state as any)?.from?.pathname;
        
        if (targetPath === '/feed') {
            logClientEvent('info', 'História de Usuário: Login concluído. Entrando no Feed.', { component: 'Login', userId: user.id });
        } else {
            logClientEvent('info', 'História de Usuário: Novo usuário detectado. Redirecionando para completar o perfil.', { component: 'Login', userId: user.id });
        }

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
        
        logClientEvent('info', 'História de Usuário: Selecionou a conta Google. Validando...', { component: 'Login', traceId });

        try {
            if (!response || !response.credential) throw new Error("Login falhou. Credencial do Google não recebida.");
            const result = await authService.loginWithGoogle(response.credential, traceId);
            if (result && result.user) {
                const isNew = result.nextStep === '/complete-profile' || !result.user.isProfileCompleted;
                handleRedirect(result.user, isNew);
            }
        } catch (err: any) {
            const displayError = `Falha na autenticação. Se o problema persistir, contate o suporte. Código: ${err.traceId || traceId}`;
            logClientEvent('error', 'História de Usuário: Falha ao validar a conta Google.', { component: 'Login', traceId, errorMessage: err.message });
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
        
        logClientEvent('info', 'História de Usuário: Tentando login com e-mail e senha.', { component: 'Login', traceId, email });

        try {
            const result = await authService.login(email, password, traceId);
            if (result && result.user) {
                const isNew = result.nextStep === '/complete-profile' || !result.user.isProfileCompleted;
                handleRedirect(result.user, isNew);
            }
        } catch (err: any) {
            const displayError = `Credenciais inválidas. Código: ${err.traceId || traceId}`;
            logClientEvent('error', 'História de Usuário: Falha no login com e-mail.', { component: 'Login', traceId, email, errorMessage: err.message });
            setError(displayError);
            setGoogleAuthProcessing(false);
        }
    };

    const handleShowEmailForm = () => {
        logClientEvent('info', 'História de Usuário: Optou por fazer login com e-mail.', { component: 'Login' });
        setShowEmailForm(true);
    };

    const handleBackToGoogle = () => {
        logClientEvent('info', 'História de Usuário: Voltou para a tela de login inicial.', { component: 'Login' });
        setShowEmailForm(false);
    };

    useEffect(() => {
        if (showEmailForm || typeof google === 'undefined') return;

        const initializeGoogleSignIn = async () => {
            if (buttonRendered.current) return;

            try {
                logClientEvent('info', 'História de Usuário: Preparando o botão de login com Google...', { component: 'Login' });
                const googleClientId = await authService.getGoogleClientId();
                const googleButtonDiv = document.getElementById(GOOGLE_BTN_ID);

                if (!googleClientId || !googleButtonDiv) {
                    const errorMsg = "A autenticação Google não está configurada ou o elemento do botão não foi encontrado.";
                    setError(errorMsg);
                    return;
                }
                
                if (buttonRendered.current) return;

                google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleCredentialResponse,
                    ux_mode: 'popup', // <-- RESTAURADO
                    cancel_on_tap_outside: true, // <-- RESTAURADO
                    auto_select: false // <-- RESTAURADO
                });

                google.accounts.id.renderButton(
                    googleButtonDiv,
                    { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', shape: 'pill' }
                );
                
                buttonRendered.current = true;
                logClientEvent('info', 'História de Usuário: Botão de login com Google está pronto.', { component: 'Login' });

            } catch (error: any) {
                setError("Erro ao inicializar o login com Google.");
            }
        };

        const timer = setTimeout(initializeGoogleSignIn, 100);
        return () => clearTimeout(timer);

    }, [showEmailForm, handleCredentialResponse]);

    if (loading) return null;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white font-['Inter'] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(/path/to/your/background.svg)'}}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00c2ff] rounded-full filter blur-[150px] opacity-20"></div>

            <div className="w-full max-w-[400px] mx-4 bg-white/5 backdrop-blur-2xl rounded-[32px] p-10 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center">
                {showEmailForm ? (
                    <LoginEmailCard 
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        onSubmit={handleEmailLogin}
                        onBackToGoogle={handleBackToGoogle}
                        loading={googleAuthProcessing}
                        error={error}
                    />
                ) : (
                    <LoginInitialCard 
                        onSelectEmail={handleShowEmailForm}
                        googleButtonId={GOOGLE_BTN_ID}
                        loading={loading}
                        googleProcessing={googleAuthProcessing}
                    />
                )}
                
                {error && !googleAuthProcessing && (
                     <p className="text-red-400 text-xs text-center mt-4 max-w-full break-words">{error}</p>
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
