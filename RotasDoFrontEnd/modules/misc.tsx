
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Leaderboard = lazy(() => import('../../Paginas/Leaderboard').then(m => ({ default: m.Leaderboard })));
const LocationSelector = lazy(() => import('../../Paginas/LocationSelector').then(m => ({ default: m.LocationSelector })));
const Maintenance = lazy(() => import('../../Paginas/Maintenance').then(m => ({ default: m.Maintenance })));
const Banned = lazy(() => import('../../Paginas/Banned').then(m => ({ default: m.Banned })));
const TermsAndPrivacy = lazy(() => import('../../componentes/ComponentesDeConfiguracoes/TermsAndPrivacy').then(m => ({ default: m.TermsAndPrivacy })));
const HelpSupport = lazy(() => import('../../Paginas/HelpSupport').then(m => ({ default: m.HelpSupport })));
const GlobalSearch = lazy(() => import('../../Paginas/GlobalSearch').then(m => ({ default: m.GlobalSearch })));


export const miscRoutes = [
  { path: '/leaderboard', element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
  { path: '/location-selector', element: <ProtectedRoute><LocationSelector /></ProtectedRoute> },
  { path: '/maintenance', element: <Maintenance /> },
  { path: '/banned', element: <Banned /> },
  { path: '/terms', element: <TermsAndPrivacy /> },
  { path: '/help', element: <HelpSupport /> },
  { path: '/global-search', element: <ProtectedRoute><GlobalSearch /></ProtectedRoute> }
];
