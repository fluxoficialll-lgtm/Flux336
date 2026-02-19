
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Settings = lazy(() => import('../../Paginas/Configuracoes').then(m => ({ default: m.Settings })));
const SecurityLogin = lazy(() => import('../../Paginas/LoginDeSeguranca').then(m => ({ default: m.SecurityLogin })));
const NotificationSettings = lazy(() => import('../../Paginas/ConfiguracoesDeNotificacao').then(m => ({ default: m.NotificationSettings })));
const LanguageSettings = lazy(() => import('../../Paginas/ConfiguracoesDeIdioma').then(m => ({ default: m.LanguageSettings })));
const BlockedUsers = lazy(() => import('../../Paginas/UsuariosBloqueados').then(m => ({ default: m.BlockedUsers })));
const TermsAndPrivacy = lazy(() => import('../../componentes/ComponentesDeConfiguracoes/ConfiguracaoTermosEPrivacidade').then(m => ({ default: m.TermsAndPrivacy })));
const HelpSupport = lazy(() => import('../../Paginas/AjudaESuporte').then(m => ({ default: m.HelpSupport })));

export const settingsRoutes = [
  { path: '/settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: '/settings/security', element: <ProtectedRoute><SecurityLogin /></ProtectedRoute> },
  { path: '/settings/notifications', element: <ProtectedRoute><NotificationSettings /></ProtectedRoute> },
  { path: '/settings/language', element: <ProtectedRoute><LanguageSettings /></ProtectedRoute> },
  { path: '/settings/blocked-users', element: <ProtectedRoute><BlockedUsers /></ProtectedRoute> },
  { path: '/terms', element: <ProtectedRoute><TermsAndPrivacy /></ProtectedRoute> },
  { path: '/help', element: <ProtectedRoute><HelpSupport /></ProtectedRoute> }
];
