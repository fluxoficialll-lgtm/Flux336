
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const Profile = lazy(() => import('../../pages/Profile').then(m => ({ default: m.Profile })));
const EditProfile = lazy(() => import('../../pages/EditProfile'));
const UserProfile = lazy(() => import('../../pages/UserProfile').then(m => ({ default: m.UserProfile })));
const CompleteProfile = lazy(() => import('../../pages/CompleteProfile').then(m => ({ default: m.CompleteProfile })));

export const profileRoutes = [
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/profile/edit', element: <ProtectedRoute><EditProfile /></ProtectedRoute> },
  { path: '/profile/:id', element: <ProtectedRoute><UserProfile /></ProtectedRoute> },
  { path: '/complete-profile', element: <ProtectedRoute><CompleteProfile /></ProtectedRoute> }
];
