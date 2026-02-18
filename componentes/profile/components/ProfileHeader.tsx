import React from 'react';
import { User } from '../../../../tipos/index.ts';

interface ProfileHeaderProps {
    user: User;
    postCount: number;
    onEditProfile: () => void;
    onShareProfile: () => void;
    onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, postCount, onEditProfile, onShareProfile, onLogout }) => {

    const profile = user?.profile;

    if (!profile) {
        return (
            <header className="p-4 bg-black">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">Perfil Incompleto</h1>
                    <button onClick={onLogout} className="text-red-500">
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
                <p className="mb-4">Seu perfil não está completo. Por favor, forneça seus detalhes.</p>
                <div className="flex items-center gap-2">
                    <button onClick={onEditProfile} className="flex-grow bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        Completar Perfil
                    </button>
                </div>
            </header>
        );
    }

    return (
        <header className="p-4 bg-black">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">{profile?.name || 'Usuário'}</h1>
                <button onClick={onLogout} className="text-red-500">
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>

            <div className="flex items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden mr-4">
                    {profile?.photoUrl && 
                        <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                    }
                </div>
                <div className="flex items-center justify-around flex-grow">
                    <div className="text-center">
                        <span className="font-bold block">{postCount}</span>
                        <span className="text-gray-400">Posts</span>
                    </div>
                    <div className="text-center">
                        <span className="font-bold block">{user.followers || 0}</span>
                        <span className="text-gray-400">Seguidores</span>
                    </div>
                    <div className="text-center">
                        <span className="font-bold block">{user.following || 0}</span>
                        <span className="text-gray-400">Seguindo</span>
                    </div>
                </div>
            </div>

            {profile?.bio && <p className="mb-4">{profile.bio}</p>}

            <div className="flex items-center gap-2">
                <button onClick={onEditProfile} className="flex-grow bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Editar Perfil
                </button>
                <button onClick={onShareProfile} className="flex-grow bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Compartilhar Perfil
                </button>
            </div>
        </header>
    );
};