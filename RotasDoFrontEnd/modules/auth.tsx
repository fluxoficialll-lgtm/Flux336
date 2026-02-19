
import React, { lazy } from 'react';

const Login = lazy(() => import('../../Paginas/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../../Paginas/Registrar').then(m => ({ default: m.Register })));
const VerifyEmail = lazy(() => import('../../Paginas/VerificarEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('../../Paginas/EsqueciMinhaSenha').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../../Paginas/RedefinirSenha').then(m => ({ default: m.ResetPassword })));
const Banned = lazy(() => import('../../Paginas/Banido').then(m => ({ default: m.Banned })));

export const authRoutes = [
  { path: '/', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/banned', element: <Banned /> }
];
