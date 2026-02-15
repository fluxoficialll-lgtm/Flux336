
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { relationshipService } from '@/services/relationshipService';
import { marketplaceService } from '@/services/marketplaceService';
import { User } from '@/types';

import { Footer } from '@/components/layout/Footer';
import { useModal } from '@/components/ModalSystem';
import { FollowListModal } from '@/components/profile/FollowListModal';
import { AvatarPreviewModal } from '@/components/ui/AvatarPreviewModal';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';
import { ProfileTabNav } from '@/features/profile/components/ProfileTabNav';
import { ProfileReelsGrid } from '@/features/profile/components/ProfileReelsGrid';
import { ProfileProductsGrid } from '@/features/profile/components/ProfileProductsGrid';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('reels');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // State from old design for modals
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followListType, setFollowListType] = useState<'followers' | 'following' | null>(null);
    const [followListData, setFollowListData] = useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Using the new, more efficient data loading logic
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser?.id) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                // The new logic fetches all necessary data
                const fullProfile = await userService.getUserProfile(currentUser.id);
                setUser(fullProfile);

                // Fetch relationship counts from the dedicated service, as per old logic's needs
                if (fullProfile.profile?.name) {
                    const followers = relationshipService.getFollowers(fullProfile.profile.name);
                    setFollowersCount(followers.length);
                }
                if (fullProfile.id) {
                    const following = relationshipService.getFollowing(fullProfile.id);
                    setFollowingCount(following.length);
                }

                // Sync posts in the background
                postService.syncUserPosts(currentUser.id);

            } catch (err) {
                console.error("Falha ao buscar dados do perfil:", err);
                setError("Não foi possível carregar o perfil.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);
    
    // --- Handlers from the old design for modals and navigation ---
    const handleShowFollowList = (type: 'followers' | 'following') => {
      if (!user) return;
      let list: any[] = [];
      if (type === 'followers' && user.profile?.name) { list = relationshipService.getFollowers(user.profile.name); }
      else if (type === 'following' && user.id) { list = relationshipService.getFollowing(user.id); }
      setFollowListData(list);
      setFollowListType(type);
    };

    const closeFollowList = () => { setFollowListType(null); setFollowListData([]); };

    const navigateToUserProfile = (username: string) => {
        closeFollowList();
        const clean = username.replace('@', '');
        navigate(`/user/${clean}`);
    };

    // --- Loading and Error states ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-black text-white">Carregando perfil...</div>;
    }
    if (error) {
        return <div className="flex justify-center items-center h-screen bg-black text-white">{error}</div>;
    }

    // --- Derived data for the UI, using the loaded user state ---
    const postCount = user ? postService.getUserPosts(user.id).length : 0;
    const handleNickname = user?.profile?.nickname || user?.profile?.name || "Usuário";
    const handleUsername = user?.profile?.name ? `@${user.profile.name}` : "@usuario";
    const displayBio = user?.profile?.bio || "Sem biografia definida.";
    const displayAvatar = user?.profile?.photoUrl;
    const displayWebsite = user?.profile?.website;
    const hasProducts = user ? marketplaceService.getItemsBySeller(user.id).length > 0 : false;

    return (
        <div className="profile-page h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-hidden">
            {/* The exact style from the old page */}
            <style>{`
                main { flex-grow: 1; overflow-y: auto; padding-top: 80px; padding-bottom: 100px; scroll-behavior: smooth; }
                .profile-card-box { background: rgba(30, 35, 45, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 30px 20px; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; margin: 0 auto 20px auto; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
                .profile-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #00c2ff; margin-bottom: 15px; background: #1e2531; cursor: pointer; }
                .profile-avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; border: 4px solid #00c2ff; margin-bottom: 15px; background: #1e2531; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #00c2ff; }
                .profile-nickname { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 2px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
                .profile-handle { font-size: 14px; color: #00c2ff; margin-bottom: 15px; font-weight: 500; }
                .profile-stats-container { display: flex; justify-content: space-around; width: 100%; margin: 20px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 0; }
                .stat-box { display: flex; flex-direction: column; align-items: center; cursor: pointer; flex: 1; }
                .stat-value { font-size: 18px; font-weight: 800; color: #fff; }
                .stat-label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
                .profile-bio { font-size: 14px; color: #e0e0e0; text-align: center; line-height: 1.5; margin-bottom: 15px; max-width: 90%; }
                .profile-link { font-size: 13px; color: #00c2ff; display: flex; align-items: center; gap: 5px; background: rgba(0,194,255,0.1); padding: 5px 12px; border-radius: 20px; text-decoration: none; }
                .profile-actions { display: flex; gap: 10px; width: 100%; justify-content: center; margin-top: 10px; }
                .profile-actions button { flex: 1; max-width: 140px; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; background: #1e2531; color: #fff; border: 1px solid #555; }
                .no-content { text-align: center; color: #666; padding: 30px 0; font-size: 14px; width: 100%; }
            `}</style>

            <ProfileHeader onHomeClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} />

            <main className="flex-grow w-full overflow-y-auto no-scrollbar" ref={scrollRef}>
                <div style={{width:'100%', maxWidth:'500px', margin:'0 auto', paddingTop:'10px', paddingBottom: '100px'}}>
                    
                    <ProfileInfoCard 
                        avatar={displayAvatar}
                        nickname={handleNickname}
                        username={handleUsername}
                        bio={displayBio}
                        website={displayWebsite}
                        stats={{
                            posts: postCount,
                            followers: followersCount,
                            following: followingCount
                        }}
                        onAvatarClick={() => setIsPreviewOpen(true)}
                        onFollowersClick={() => handleShowFollowList('followers')}
                        onFollowingClick={() => handleShowFollowList('following')}
                        onEditClick={() => navigate('/edit-profile')}
                        onShareClick={() => alert('Compartilhar')}
                    />

                    <div className="profile-tabs-container">
                        <ProfileTabNav 
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabs={[
                                { id: 'reels', label: 'Reels' },
                                ...(hasProducts ? [{ id: 'store', label: 'Loja' }] : [])
                            ]}
                        />

                        <div className="mt-4">
                            {activeTab === 'reels' && user && <ProfileReelsGrid userId={user.id} />}
                            {activeTab === 'store' && user && <ProfileProductsGrid userId={user.id} />}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <FollowListModal 
                type={followListType} 
                data={followListData} 
                onClose={closeFollowList} 
                onUserClick={navigateToUserProfile} 
            />
            
            <AvatarPreviewModal 
                isOpen={isPreviewOpen} 
                onClose={() => setIsPreviewOpen(false)} 
                imageSrc={displayAvatar || ''} 
                username={handleNickname || ''} 
            />
        </div>
    );
};
