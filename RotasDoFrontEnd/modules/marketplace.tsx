
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Marketplace = lazy(() => import('../../Paginas/Marketplace').then(m => ({ default: m.Marketplace })));
const ProductDetails = lazy(() => import('../../Paginas/ProductDetails').then(m => ({ default: m.ProductDetails })));
const CreateMarketplaceItem = lazy(() => import('../../Paginas/CreateMarketplaceItem').then(m => ({ default: m.CreateMarketplaceItem })));
const MyStore = lazy(() => import('../../Paginas/MyStore').then(m => ({ default: m.MyStore })));
const AdPlacementSelector = lazy(() => import('../../Paginas/AdPlacementSelector').then(m => ({ default: m.AdPlacementSelector })));
const CampaignPerformance = lazy(() => import('../../Paginas/CampaignPerformance').then(m => ({ default: m.CampaignPerformance })));
const AdCampaignTypeSelector = lazy(() => import('../../Paginas/AdCampaignTypeSelector').then(m => ({ default: m.AdCampaignTypeSelector })));
const AdContentSelector = lazy(() => import('../../Paginas/AdContentSelector').then(m => ({ default: m.AdContentSelector })));

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
