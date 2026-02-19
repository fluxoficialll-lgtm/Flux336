import React, { useEffect, useRef, useState, useCallback, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../ServiçosDoFrontend/ServiçoDeAutenticacao/authService';
import { groupService } from '../ServiçosDoFrontend/ServiçoDeGrupos/groupService';
import { chatService } from '../ServiçosDoFrontend/ServiçoDeChat/chatService';
import { Group } from '../types';
import { db } from '../database';
import { useModal } from '../componentes/ComponentesDeInterface/ModalSystem';
import { Footer } from '../componentes/ComponentesDeLayout/Footer';
import { MainHeader } from '../componentes/ComponentesDeLayout/MainHeader';
import { JoinViaLinkBtn } from '../componentes/ComponentesDeGrupos/list/JoinViaLinkBtn';
import { GroupListItem } from '../componentes/ComponentesDeGrupos/list/GroupListItem';
import { CreateGroupFAB } from '../componentes/ComponentesDeGrupos/list/CreateGroupFAB';

const TrackingModal = lazy(() => import('../componentes/ComponentesDeGrupos/TrackingModal').then(m => ({ default: m.TrackingModal })));

export const Groups: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert, showConfirm, showPrompt } = useModal();

  const [uiVisible, setUiVisible] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedGroupForTracking, setSelectedGroupForTracking] = useState<Group | null>(null);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
  const LIMIT = 15;

  const lastScrollY = useRef(0);
  const isFetchingRef = useRef(false);
  const hasLoadedInitialRef = useRef(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const mergeGroups = useCallback((newGroups: Group[], reset: boolean = false) => {
    if (!newGroups) return;
    setGroups(prev => {
        const combined = reset ? newGroups : [...prev, ...newGroups];
        const uniqueMap = new Map<string, Group>();
        combined.forEach(g => {
            if (g && g.id && !uniqueMap.has(g.id)) {
                uniqueMap.set(g.id, g);
            }
        });
        return Array.from(uniqueMap.values());
    });
  }, []);

  const fetchGroups = useCallback(async (cursor?: number, reset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!cursor) setLoading(true);

    try {
        const response = await groupService.getGroupsPaginated(cursor || 0, LIMIT);
        const fetched = response.groups || [];

        if (reset) {
            mergeGroups(fetched, true);
        } else if (fetched.length > 0) {
            mergeGroups(fetched, false);
        }

        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor && fetched.length > 0);
    } catch (error) {
        console.error("Erro ao buscar grupos:", error);
        if (!cursor) setHasMore(false);
    } finally {
        setLoading(false);
        isFetchingRef.current = false;
    }
  }, [LIMIT, mergeGroups]);

  const loadInitialGroups = useCallback(async () => {
    if (hasLoadedInitialRef.current) return;
    hasLoadedInitialRef.current = true;

    const localGroups = db.groups.getAll();
    if (localGroups && localGroups.length > 0) {
        mergeGroups(localGroups, true);
    }

    await fetchGroups(undefined, localGroups.length === 0);
  }, [fetchGroups, mergeGroups]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user?.email) { navigate('/'); return; }
    setCurrentUserEmail(user.email);
    setCurrentUserId(user.id);

    loadInitialGroups();

    const unsubscribe = db.subscribe('groups', () => {
        setGroups(currentGroups => {
            let changed = false;
            const nextGroups = currentGroups.map(g => {
                const latest = db.groups.findById(g.id);
                if (latest && JSON.stringify(latest) !== JSON.stringify(g)) {
                    changed = true;
                    return { ...g, ...latest };
                }
                return g;
            });
            return changed ? nextGroups : currentGroups;
        });
    });

    const params = new URLSearchParams(location.search);
    const joinCode = params.get('join');
    if (joinCode) { handleJoinByLink(joinCode); navigate('/groups', { replace: true }); }

    return () => unsubscribe();
  }, [navigate, location.search, loadInitialGroups]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingRef.current && nextCursor) {
            fetchGroups(nextCursor);
        }
    }, { threshold: 0.5 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, nextCursor, fetchGroups]);

  const handleGroupClick = (group: Group) => {
      const isCreator = group.creatorEmail === currentUserEmail;
      const isMember = group.memberIds?.includes(currentUserId || '');
      
      if (group.isSalesPlatformEnabled && (isCreator || isMember)) {
          navigate(`/group-platform/${group.id}`);
          return;
      }

      if (isCreator || isMember) {
          if (group.isVip && !isCreator && currentUserId) {
               const hasAccess = db.vipAccess.check(currentUserId, group.id);
               if (!hasAccess) { navigate(`/vip-group-sales/${group.id}`); return; }
          }
          
          const hasMultipleChannels = group.channels && group.channels.length > 0;
          if (hasMultipleChannels) {
              navigate(`/group/${group.id}/channels`);
          } else {
              navigate(`/group-chat/${group.id}`);
          }
      } else if (group.isVip) { navigate(`/vip-group-sales/${group.id}`); }
      else { navigate(`/group-landing/${group.id}`); }
  };

  const handleJoinByLink = (inputCode: string) => {
      if (!inputCode.trim()) return;
      let code = inputCode;
      if (code.includes('?join=')) code = code.split('?join=')[1];
      const result = groupService.joinGroupByLinkCode(code);
      if (result.success) { 
          showAlert("Sucesso!", result.message); 
          if (result.groupId) {
              const group = groupService.getGroupById(result.groupId);
              if (group && group.channels && group.channels.length > 0) {
                  navigate(`/group/${result.groupId}/channels`);
              } else {
                  navigate(`/group-chat/${result.groupId}`);
              }
          }
          else loadInitialGroups(); 
      }
      else { showAlert("Ops!", result.message); }
  };

  const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
      e.stopPropagation(); 
      setActiveMenuId(null);
      if (await showConfirm("Excluir Grupo?", "Tem certeza que deseja excluir este grupo permanentemente?", "Excluir", "Cancelar")) {
          groupService.deleteGroup(groupId);
          setGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
      }
  };

  const handleOpenTracking = (group: Group, e: React.MouseEvent) => { 
      e.stopPropagation(); 
      setActiveMenuId(null); 
      setSelectedGroupForTracking(group); 
      setIsTrackingModalOpen(true); 
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-x-hidden">
      <MainHeader 
        leftContent={
            <button onClick={() => navigate('/top-groups')} className="bg-none border-none text-[#00c2ff] text-lg cursor-pointer">
                <i className="fa-solid fa-ranking-star"></i>
            </button>
        }
        rightContent={
            <button onClick={() => navigate('/messages')} className="bg-none border-none text-[#00c2ff] text-lg cursor-pointer">
                <i className="fa-solid fa-message"></i>
            </button>
        }
        onLogoClick={() => window.scrollTo({top:0, behavior:'smooth'})}
      />

      <main className="flex-grow pt-[100px] pb-[100px] px-4">
        <JoinViaLinkBtn onClick={async () => {
            const code = await showPrompt("Entrar via Link", "Cole o código do grupo:", "Ex: AF72B");
            if (code) handleJoinByLink(code);
        }} />

        <div className="w-full">
            {groups.length > 0 ? (
                groups.map(group => (
                    <GroupListItem 
                        key={group.id}
                        group={group}
                        currentUserEmail={currentUserEmail}
                        unreadCount={chatService.getGroupUnreadCount(group.id)}
                        isMenuActive={activeMenuId === group.id}
                        onToggleMenu={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === group.id ? null : group.id); }}
                        onItemClick={() => handleGroupClick(group)}
                        onTracking={(e) => handleOpenTracking(group, e)}
                        onDelete={(e) => handleDeleteGroup(group.id, e)}
                    />
                ))
            ) : loading ? (
                <div className="text-center mt-10"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#00c2ff]"></i></div>
            ) : (
                <div className="text-center text-gray-500 mt-10">Você não participa de nenhum grupo.</div>
            )}
            <div ref={loaderRef} className="h-10"></div>
        </div>
      </main>

      <CreateGroupFAB 
        visible={uiVisible} 
        onClick={() => navigate('/create-group')} 
      />

      <Footer visible={uiVisible} />

      {isTrackingModalOpen && selectedGroupForTracking && (
          <Suspense fallback={null}>
              <TrackingModal 
                isOpen={isTrackingModalOpen}
                onClose={() => setIsTrackingModalOpen(false)}
                group={selectedGroupForTracking}
              />
          </Suspense>
      )}
    </div>
  );
};