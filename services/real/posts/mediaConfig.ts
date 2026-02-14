'''
// Única fonte de verdade para os nomes das pastas de mídia no Cloudflare R2.
// Isso evita erros de digitação e centraliza a configuração.

export const MediaFolders = {
    FEED: 'feed',
    GROUPS: 'groups',
    REELS: 'reels',
    MARKETPLACE: 'marketplace',
    PROFILES: 'profiles' // Adicionando uma pasta para fotos de perfil, por exemplo.
} as const; // 'as const' torna os valores do objeto imutáveis (readonly)

// Cria um tipo para ser usado em outras partes da aplicação
export type MediaFolder = typeof MediaFolders[keyof typeof MediaFolders];
'''