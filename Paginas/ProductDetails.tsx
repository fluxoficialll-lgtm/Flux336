
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marketplaceService } from '../ServiçosDoFrontend/ServiçoDeLoja/marketplaceService';
import { authService } from '../ServiçosDoFrontend/ServiçoDeAutenticacao/authService';
import { chatService } from '../ServiçosDoFrontend/ServiçoDeChat/chatService';
import { db } from '@/database';
import { MarketplaceItem, ChatMessage } from '../types/index';
import { useModal } from '../componentes/ModalSystem';

// Componentes Modulares
import { ProductHeader } from '../componentes/ComponentesDeLoja/detalhes/ProductHeader';
import { ProductMediaGallery } from '../componentes/ComponentesDeLoja/detalhes/ProductMediaGallery';
import { ProductInfo } from '../componentes/ComponentesDeLoja/detalhes/ProductInfo';
import { ProductSellerCard } from '../componentes/ComponentesDeLoja/detalhes/ProductSellerCard';
import { ProductDescription } from '../componentes/ComponentesDeLoja/detalhes/ProductDescription';
import { ProductBottomBar } from '../componentes/ComponentesDeLoja/detalhes/ProductBottomBar';
import { ProductLightbox } from '../componentes/ComponentesDeLoja/detalhes/ProductLightbox';
import { CommentSheetContainer } from '../componentes/ComponentesDeUI/comentarios/CommentSheetContainer'; // NOSSO NOVO CONTAINER

export const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showConfirm } = useModal();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  
  // Estado simplificado: apenas para controlar a visibilidade do painel
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Estado para o zoom da mídia
  const [zoomedMedia, setZoomedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  
  const currentUser = authService.getCurrentUser();

  const loadData = useCallback(() => {
    if (id) {
        const foundItem = marketplaceService.getItemById(id);
        if (foundItem) {
          setItem(foundItem);
          if (currentUser && (currentUser.email === foundItem.sellerId || currentUser.id === foundItem.sellerId)) {
              setIsSeller(true);
          }
        }
      }
      setLoading(false);
  }, [id, currentUser]);

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('marketplace', loadData);
    return () => unsub();
  }, [loadData]);

  // A lógica de chat permanece a mesma
  const handleChat = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      if (!currentUser || !item) return;
      if (isSeller) return;
      try {
          const chatId = chatService.getPrivateChatId(currentUser.email, item.sellerId);
          // ... (lógica de criação de mensagem de contexto)
          navigate(`/chat/${chatId}`);
      } catch (err) {
          console.error(err);
      }
  };

  // A lógica de deleção do item permanece a mesma
  const handleDelete = async () => {
      const confirmed = await showConfirm(
          "Excluir Anúncio",
          "Tem certeza que deseja excluir este anúncio permanentemente?",
          "Excluir",
          "Cancelar"
      );
      if (confirmed && id) {
          marketplaceService.deleteItem(id);
          navigate('/marketplace');
      }
  };

  const navigateToStore = () => {
      if (!item) return;
      navigate(`/user/${item.sellerName}`, { state: { activeTab: 'products' } });
  };

  const mediaItems = useMemo(() => {
      if (!item) return [];
      // ... (lógica de montagem de mídia)
      return [];
  }, [item]);

  if (loading || !item) return <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0c0f14] text-white font-['Inter'] flex flex-col relative pb-[90px]">
      {/* Estilos e outros componentes permanecem aqui... */}

      <ProductHeader />

      <div className="product-container">
          <ProductMediaGallery 
            mediaItems={mediaItems} 
            onMediaClick={(m) => setZoomedMedia(m)} 
          />

          <div className="details-wrapper">
              <ProductInfo 
                title={item.title}
                price={item.price}
                location={item.location}
                category={item.category}
                timestamp={item.timestamp}
              />

              <ProductSellerCard 
                sellerName={item.sellerName || 'Vendedor'}
                sellerAvatar={item.sellerAvatar}
                onClick={navigateToStore}
              />

              <ProductDescription description={item.description} />

              {/* O botão agora apenas abre o painel. O número de comentários virá do nosso hook. */}
              <button className="qa-trigger-btn" onClick={() => setIsCommentModalOpen(true)}>
                  <span className="font-bold text-sm"><i className="fa-regular fa-comments mr-2 text-[#00c2ff]"></i> Perguntas e Respostas</span>
                  <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
          </div>
      </div>

      <ProductBottomBar 
        isSeller={isSeller}
        onDelete={handleDelete}
        onChat={handleChat}
      />

      <ProductLightbox 
        media={zoomedMedia}
        onClose={() => setZoomedMedia(null)}
      />

      {/* USANDO O NOVO CONTAINER DE COMENTÁRIOS */}
      {isCommentModalOpen && id && (
          <CommentSheetContainer 
              isOpen={isCommentModalOpen}
              onClose={() => setIsCommentModalOpen(false)}
              commentableType="marketplace"
              commentableId={id}
              title="Perguntas e Respostas"
          />
      )}
    </div>
  );
};
