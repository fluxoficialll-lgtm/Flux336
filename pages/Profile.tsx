
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useUserProfile } from '@/features/profile/hooks/useUserProfile';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileTabNav } from '@/features/profile/components/ProfileTabNav';
import { ProfileReelsGrid } from '@/features/profile/components/ProfileReelsGrid';
import { ProfileProductsGrid } from '@/features/profile/components/ProfileProductsGrid';

/**
 * Componente da Página de Perfil.
 * A lógica complexa foi abstraída para o hook `useUserProfile`.
 * A responsabilidade deste componente é puramente a apresentação dos dados.
 */
export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading, error } = useUserProfile();
    const [activeTab, setActiveTab] = useState('reels');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Estado de Carregamento Inicial: Mostra um loader enquanto os dados iniciais são buscados.
    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-black text-white">Carregando Perfil...</div>;
    }

    // Se o hook não retornar um usuário, exibe uma mensagem de erro fundamental.
    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
                <p className="mb-4">Não foi possível carregar o perfil. Por favor, tente novamente.</p>
                <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-500 rounded">Ir para Login</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Exibe um alerta de erro não-bloqueante se a atualização dos dados falhar */}
            {error && <div className="p-3 text-center text-white bg-red-600">{error}</div>}

            <ProfileHeader
                user={user}
                postCount={0} // Este valor pode vir do `user` no futuro
                onEditProfile={() => navigate('/profile/edit')}
                onShareProfile={() => { /* Implementar compartilhamento */ }}
                onLogout={handleLogout}
            />

            <main className="p-4">
                <ProfileTabNav activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="mt-4">
                    {activeTab === 'reels' && <ProfileReelsGrid />}
                    {activeTab === 'store' && <ProfileProductsGrid />}
                </div>
            </main>
        </div>
    );
};
