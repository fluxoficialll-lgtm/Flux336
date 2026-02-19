
import React, { lazy } from 'react';
import { ProtectedRoute } from '@/componentes/ComponentesDeLogin/ProtectedRoute';

const Feed = lazy(() => import('../../Paginas/Feed').then(m => ({ default: m.Feed })));
const PostDetails = lazy(() => import('../../Paginas/DetalhesDaPostagem').then(m => ({ default: m.PostDetails })));
const CreatePost = lazy(() => import('../../Paginas/CriarPostagem').then(m => ({ default: m.CreatePost })));
const CreatePoll = lazy(() => import('../../Paginas/CriarEnquete').then(m => ({ default: m.CreatePoll })));
const Reels = lazy(() => import('../../Paginas/Reels').then(m => ({ default: m.Reels })));
const CreateReel = lazy(() => import('../../Paginas/CriarReel').then(m => ({ default: m.CreateReel })));
const ReelsSearch = lazy(() => import('../../Paginas/PesquisaDeReels').then(m => ({ default: m.ReelsSearch })));
const FeedSearch = lazy(() => import('../../Paginas/PesquisaNoFeed').then(m => ({ default: m.FeedSearch })));

export const feedRoutes = [
  { path: '/feed', element: <ProtectedRoute><Feed /></ProtectedRoute> },
  { path: '/post/:id', element: <ProtectedRoute><PostDetails /></ProtectedRoute> },
  { path: '/create-post', element: <ProtectedRoute><CreatePost /></ProtectedRoute> },
  { path: '/create-poll', element: <ProtectedRoute><CreatePoll /></ProtectedRoute> },
  { path: '/reels', element: <ProtectedRoute><Reels /></ProtectedRoute> },
  { path: '/reels/:id', element: <ProtectedRoute><Reels /></ProtectedRoute> },
  { path: '/reels-search', element: <ProtectedRoute><ReelsSearch /></ProtectedRoute> },
  { path: '/feed-search', element: <ProtectedRoute><FeedSearch /></ProtectedRoute> },
  { path: '/create-reel', element: <ProtectedRoute><CreateReel /></ProtectedRoute> }
];
