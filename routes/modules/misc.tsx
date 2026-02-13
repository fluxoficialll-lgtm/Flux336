
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const Leaderboard = lazy(() => import('../../pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const LocationSelector = lazy(() => import('../../pages/LocationSelector').then(m => ({ default: m.LocationSelector })));
const Maintenance = lazy(() => import('../../pages/Maintenance').then(m => ({ default: m.Maintenance })));
const Banned = lazy(() => import('../../pages/Banned').then(m => ({ default: m.Banned })));
const TermsAndPrivacy = lazy(() => import('../../pages/TermsAndPrivacy').then(m => ({ default: m.TermsAndPrivacy })));
const HelpSupport = lazy(() => import('../../pages/HelpSupport').then(m => ({ default: m.HelpSupport })));
const GlobalSearch = lazy(() => import('../../pages/GlobalSearch').then(m => ({ default: m.GlobalSearch })));


export const miscRoutes = [
  { path: '/leaderboard', element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
  { path: '/location-selector', element: <ProtectedRoute><LocationSelector /></ProtectedRoute> },
  { path: '/maintenance', element: <Maintenance /> },
  { path: '/banned', element: <Banned /> },
  { path: '/terms', element: <TermsAndPrivacy /> },
  { path: '/help', element: <HelpSupport /> },
  { path: '/global-search', element: <ProtectedRoute><GlobalSearch /></ProtectedRoute> }
];
