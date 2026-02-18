
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Profile = lazy(() => import('../../Paginas/Profile').then(m => ({ default: m.Profile })));
const EditProfile = lazy(() => import('../../Paginas/EditProfile'));
const UserProfile = lazy(() => import('../../Paginas/UserProfile').then(m => ({ default: m.UserProfile })));
const CompleteProfile = lazy(() => import('../../Paginas/CompleteProfile').then(m => ({ default: m.CompleteProfile })));

export const profileRoutes = [
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/profile/edit', element: <ProtectedRoute><EditProfile /></ProtectedRoute> },
  { path: '/profile/:id', element: <ProtectedRoute><UserProfile /></ProtectedRoute> },
  { path: '/complete-profile', element: <ProtectedRoute><CompleteProfile /></ProtectedRoute> }
];
