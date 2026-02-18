
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const FinancialPanel = lazy(() => import('../../Paginas/FinancialPanel').then(m => ({ default: m.FinancialPanel })));
const ProviderConfig = lazy(() => import('../../Paginas/ProviderConfig').then(m => ({ default: m.ProviderConfig })));
const TransactionHistoryPage = lazy(() => import('../../Paginas/TransactionHistoryPage').then(m => ({ default: m.TransactionHistoryPage })));

export const financialRoutes = [
  { path: '/financial', element: <ProtectedRoute><FinancialPanel /></ProtectedRoute> },
  { path: '/financial/providers', element: <ProtectedRoute><ProviderConfig /></ProtectedRoute> },
  { path: '/financial/transactions', element: <ProtectedRoute><TransactionHistoryPage /></ProtectedRoute> }
];
