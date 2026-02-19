
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Leaderboard = lazy(() => import('../../Paginas/PlacarDeLideres').then(m => ({ default: m.Leaderboard })));
const LocationSelector = lazy(() => import('../../Paginas/SeletorDeLocalizacao').then(m => ({ default: m.LocationSelector })));
const Maintenance = lazy(() => import('../../Paginas/Manutencao').then(m => ({ default: m.Maintenance })));
const Banned = lazy(() => import('../../Paginas/Banido').then(m => ({ default: m.Banned })));
const TermsAndPrivacy = lazy(() => import('../../componentes/ComponentesDeConfiguracoes/ConfiguracaoTermosEPrivacidade').then(m => ({ default: m.TermsAndPrivacy })));
const HelpSupport = lazy(() => import('../../Paginas/AjudaESuporte').then(m => ({ default: m.HelpSupport })));
const GlobalSearch = lazy(() => import('../../Paginas/PesquisaGlobal').then(m => ({ default: m.GlobalSearch })));


export const miscRoutes = [
  { path: '/leaderboard', element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
  { path: '/location-selector', element: <ProtectedRoute><LocationSelector /></ProtectedRoute> },
  { path: '/maintenance', element: <Maintenance /> },
  { path: '/banned', element: <Banned /> },
  { path: '/terms', element: <TermsAndPrivacy /> },
  { path: '/help', element: <HelpSupport /> },
  { path: '/global-search', element: <ProtectedRoute><GlobalSearch /></ProtectedRoute> }
];
