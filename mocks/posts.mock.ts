
import { Post } from '../types';

/**
 * MOCK_POSTS otimizado para o fluxo de "Impulsionar Existente".
 * Contém uma mistura de posts orgânicos e anúncios para o usuário 'u-creator-002'.
 * IDs foram corrigidos para usar o formato UUID.
 */
export const MOCK_POSTS: Post[] = [
    // --- ADS GLOBAIS (APARECEM NO FEED DE TODOS) ---
    {
        id: 'd2f9b8a0-3e7b-4b1e-9d4f-1a2b3c4d5e6f', // Corrigido
        authorId: 'u-creator-002',
        username: '@flux_ads',
        text: 'Domine o mercado digital com as ferramentas certas. Conheça nossa nova suíte de automação para criadores de conteúdo! 🚀',
        time: 'Patrocinado',
        timestamp: Date.now() + 1000,
        isPublic: true,
        views: 45200,
        likes: 1200,
        comments: 45,
        liked: false,
        type: 'photo',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
        isAd: true,
        ctaText: 'saiba mais',
        ctaLink: '/marketplace',
        location: undefined
    },

    // --- CONTEÚDOS EXISTENTES DO USUÁRIO (PARA IMPULSIONAR) ---
    {
        id: 'e3a0b8d4-5c1e-4f9a-8d2b-1c2d3e4f5a6b', // Corrigido
        authorId: 'u-creator-002',
        username: '@pixel_master',
        text: 'Estratégias de escala para 2024. O tráfego pago mudou e você precisa se adaptar! 🔥 #Marketing #ROI',
        time: '2d',
        timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
        isPublic: true,
        views: 8400,
        likes: 920,
        comments: 56,
        liked: true,
        type: 'photo',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
        isAd: false,
        location: 'São Paulo, SP'
    },
    {
        id: 'f4b1c9e5-6d2f-4a8b-9e3c-2d3e4f5a6b7c', // Corrigido
        authorId: 'u-creator-002',
        username: '@pixel_master',
        text: '3 Passos para criar uma oferta irresistível no seu Grupo VIP. Arraste para o lado! ➡️',
        time: '4d',
        timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000),
        isPublic: true,
        views: 12000,
        likes: 2100,
        comments: 89,
        liked: false,
        type: 'photo',
        images: [
            'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop'
        ],
        isAd: false
    },
    {
        id: 'a5c2d0f6-7e3a-4b9c-8f4d-3e4f5a6b7c8d', // Corrigido
        authorId: 'u-creator-002',
        username: '@pixel_master',
        text: 'Minha rotina de análise de métricas matinal. ☕📈 #DataScience #Ads',
        time: '1d',
        timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000),
        isPublic: true,
        views: 25600,
        likes: 4500,
        comments: 112,
        liked: false,
        type: 'video',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-tablet-screen-23053-large.mp4',
        isAd: false
    },
    {
        id: 'b6d3e1a7-8f4b-4c8d-9a5e-4f5a6b7c8d9e', // Corrigido
        authorId: 'u-creator-002',
        username: '@pixel_master',
        text: 'Como sair do zero no Flux Marketplace hoje mesmo!',
        time: '6h',
        timestamp: Date.now() - (6 * 60 * 60 * 1000),
        isPublic: true,
        views: 5200,
        likes: 890,
        comments: 34,
        liked: false,
        type: 'video',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-hand-taking-a-credit-card-out-of-a-wallet-22442-large.mp4',
        isAd: false
    },
    {
        id: 'c7e4f2b8-9a5c-4d7e-8b6f-5a6b7c8d9e0f', // Corrigido
        authorId: 'u-creator-002',
        username: '@pixel_master',
        text: 'Pergunta rápida: Qual rede social está dando mais ROI para vocês neste mês? 💸',
        time: '1w',
        timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
        isPublic: true,
        views: 1200,
        likes: 45,
        comments: 203,
        liked: false,
        type: 'poll',
        pollOptions: [
            { text: 'Meta (FB/IG)', votes: 85 },
            { text: 'TikTok', votes: 62 },
            { text: 'Google/YouTube', votes: 56 }
        ],
        isAd: false
    },

    // --- OUTROS POSTS DO FEED ---
    {
        id: 'd8f5a3c9-0b6d-4e6f-9c7a-6b7c8d9e0f1a', // Corrigido
        authorId: 'u-admin-001',
        username: '@flux_official',
        text: 'Bem-vindo ao Flux! 🚀 Esta é a sua nova plataforma de conexão e monetização de comunidades.',
        time: 'Agora',
        timestamp: Date.now(),
        isPublic: true,
        views: 1250,
        likes: 450,
        comments: 12,
        liked: false,
        type: 'text',
        isAd: false,
        location: 'Sede Global'
    },
    {
        id: 'e9a6b4da-1c7e-4f5a-8d8b-7c8d9e0f1a2b', // Corrigido
        authorId: 'u-star-004',
        username: '@julia_vendas',
        text: 'Confira os resultados da nossa última mentoria de escala. O time está voando! 📈',
        time: '15m',
        timestamp: Date.now() - 900000,
        isPublic: true,
        views: 2500,
        likes: 670,
        comments: 42,
        liked: false,
        type: 'photo',
        image: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?q=80&w=800&auto=format&fit=crop',
        isAd: false,
        relatedGroupId: 'g-vip-001'
    }
];
