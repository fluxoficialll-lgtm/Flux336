
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Notifications = lazy(() => import('../../Paginas/Notificacoes').then(m => ({ default: m.Notifications })));
const Messages = lazy(() => import('../../Paginas/Mensagens').then(m => ({ default: m.Messages })));

export const notificationRoutes = [
  { path: '/notifications', element: <ProtectedRoute><Notifications /></ProtectedRoute> },
  { path: '/messages', element: <ProtectedRoute><Messages /></ProtectedRoute> }
];
