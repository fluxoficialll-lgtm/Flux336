
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marketplaceService } from '@/ServiçosDoFrontend/ServiçoDeMarketplace/marketplaceService';
import { authService } from '@/ServiçosDoFrontend/ServiçoDeAutenticacao/authService';
import { chatService } from '@/ServiçosDoFrontend/ServiçoDeChat/chatService';
import { db } from '@/database';
import { MarketplaceItem, ChatMessage } from '@/types/index';
import { useModal } from '@/componentes/ComponentesDeInterface/ModalSystem';

// Componentes Modulares
import { ProdutoCabecalho as ProductHeader } from '@/componentes/ComponentesDeDetahesDeProdutos/componentes/details/ProdutoCabecalho';
import { ProdutoGaleriaDeMidia as ProductMediaGallery } from '@/componentes/ComponentesDeDetahesDeProdutos/componentes/details/ProdutoGaleriaDeMidia';
import { ProdutoInformacao as ProductInfo } from '@/componentes/ComponentesDeDetahesDeProdutos/componentes/details/ProdutoInformacao';
import { ProdutoCartaoDeVendedor as ProductSellerCard } from '@/componentes/ComponentesDeDetahesDeProdutos/componentes/details/ProdutoCartaoDeVendedor';
import { ProdutoDescricao as ProductDescription } from '@/componentes/ComponentesDeDetahesDeProdutos/componentes/details/ProdutoDescricao';
import { ProdutoBarraInferior as ProductBottomBar } from '@/componentes/ComponentesDeDetahesDeProdutos/componentes/details/ProdutoBarraInferior';
import { ProdutoCaixaDeLuz as ProductLightbox } from '@/componentes/ComponentesDeDetahesDeProdutos/componentes/details/ProdutoCaixaDeLuz';
import { CommentSheetContainer } from '@/componentes/ComponentesDeInterface/comments/CommentSheetContainer';

export const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showConfirm } = useModal();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

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

  const handleChat = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      if (!currentUser || !item) return;
      if (isSeller) return;
      try {
          const chatId = chatService.getPrivateChatId(currentUser.email, item.sellerId);
          navigate(`/chat/${chatId}`);
      } catch (err) {
          console.error(err);
      }
  };

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
      return [];
  }, [item]);

  if (loading || !item) return <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0c0f14] text-white font-['Inter'] flex flex-col relative pb-[90px]">

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
