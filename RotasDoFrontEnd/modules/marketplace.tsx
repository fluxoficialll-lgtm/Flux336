
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Marketplace = lazy(() => import('../../Paginas/Mercado').then(m => ({ default: m.Marketplace })));
const ProductDetails = lazy(() => import('../../Paginas/DetalhesDoProduto').then(m => ({ default: m.ProductDetails })));
const CreateMarketplaceItem = lazy(() => import('../../Paginas/CriarItemDoMercado').then(m => ({ default: m.CreateMarketplaceItem })));
const MyStore = lazy(() => import('../../Paginas/MinhaLoja').then(m => ({ default: m.MyStore })));
const AdPlacementSelector = lazy(() => import('../../Paginas/SeletorDePosicionamentoDeAnuncio').then(m => ({ default: m.AdPlacementSelector })));
const CampaignPerformance = lazy(() => import('../../Paginas/DesempenhoDaCampanha').then(m => ({ default: m.CampaignPerformance })));
const AdCampaignTypeSelector = lazy(() => import('../../Paginas/SeletorDeTipoDeCampanhaDeAnuncio').then(m => ({ default: m.AdCampaignTypeSelector })));
const AdContentSelector = lazy(() => import('../../Paginas/SeletorDeConteudoDeAnuncio').then(m => ({ default: m.AdContentSelector })));

export const marketplaceRoutes = [
  { path: '/marketplace', element: <ProtectedRoute><Marketplace /></ProtectedRoute> },
  { path: '/marketplace/product/:id', element: <ProtectedRoute><ProductDetails /></ProtectedRoute> },
  { path: '/create-marketplace-item', element: <ProtectedRoute><CreateMarketplaceItem /></ProtectedRoute> },
  { path: '/my-store', element: <ProtectedRoute><MyStore /></ProtectedRoute> },
  { path: '/ad-placement-selector', element: <ProtectedRoute><AdPlacementSelector /></ProtectedRoute> },
  { path: '/campaign-performance/:id', element: <ProtectedRoute><CampaignPerformance /></ProtectedRoute> },
  { path: '/ad-type-selector', element: <ProtectedRoute><AdCampaignTypeSelector /></ProtectedRoute> },
  { path: '/ad-content-selector', element: <ProtectedRoute><AdContentSelector /></ProtectedRoute> }
];
