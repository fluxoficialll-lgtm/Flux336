
// Tipagem para o "DNA" de um conteúdo.
// Representa as categorias e nichos identificados pela IA.
export interface ContentDNA {
    primaryCategory: string;   // Categoria principal (ex: "Esportes")
    subCategory: string;       // Subcategoria (ex: "Futebol")
    niche: string;             // Nicho específico (ex: "Treinamento de Goleiros")
    tags: string[];            // Tags adicionais para busca e agrupamento
}
