
import { GoogleGenAI } from "@google/genai";
import { Post, MarketplaceItem } from "../../../types";

// Tipagem para o "DNA" de um conteúdo.
// Representa as categorias e nichos identificados pela IA.
export interface ContentDNA {
    primaryCategory: string;   // Categoria principal (ex: "Esportes")
    subCategory: string;       // Subcategoria (ex: "Futebol")
    niche: string;             // Nicho específico (ex: "Treinamento de Goleiros")
    tags: string[];            // Tags adicionais para busca e agrupamento
}

// O ContentDnaService é responsável por analisar uma peça de conteúdo
// e "extrair" seu DNA, ou seja, identificar seu nicho e categorizá-lo
// usando a IA do Google (Gemini).
export class ContentDnaService {

    private static ai: GoogleGenAI | null = null;

    /**
     * Inicializa o cliente da IA.
     * É feito de forma estática para reutilizar a mesma instância.
     */
    private static initializeAI() {
        if (!this.ai && process.env.API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    }

    /**
     * Gera o DNA de um conteúdo (Post ou MarketplaceItem).
     * @param content - O item de conteúdo a ser analisado.
     * @returns O objeto ContentDNA ou null em caso de falha.
     */
    public static async generateDna(content: Post | MarketplaceItem): Promise<ContentDNA | null> {
        this.initializeAI();
        if (!this.ai) {
            console.error("ContentDnaService: Chave de API da IA não configurada.");
            return null;
        }

        // Constrói o texto que será enviado para análise.
        // Inclui o título (se houver) e o texto/descrição principal.
        const textToAnalyze = `${'title' in content ? content.title : ''} ${'text' in content ? content.text : ''}`.trim();

        if (!textToAnalyze) {
            return null; // Não há texto para analisar.
        }

        try {
            // Constrói o prompt para a IA.
            // Pede para a IA categorizar o conteúdo e retornar em formato JSON.
            const prompt = `
                Analise o seguinte texto e identifique seu nicho de conteúdo.
                Texto: "${textToAnalyze}"

                Responda com um objeto JSON contendo as seguintes chaves:
                - "primaryCategory": A categoria mais ampla (ex: "Tecnologia", "Saúde", "Entretenimento").
                - "subCategory": Uma subcategoria mais específica (ex: "Programação", "Nutrição", "Cinema").
                - "niche": O nicho detalhado do conteúdo (ex: "Desenvolvimento Web com React", "Dieta Cetogênica", "Filmes de Ficção Científica dos anos 80").
                - "tags": Um array de 3 a 5 tags ou palavras-chave relevantes.

                Sua resposta deve ser APENAS o objeto JSON, sem nenhum texto ou formatação adicional.
            `;

            const response = await this.ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            // Extrai e limpa a resposta JSON da IA.
            const jsonResponse = response.text?.trim().replace(/```json/g, '').replace(/```/g, '');
            if (jsonResponse) {
                return JSON.parse(jsonResponse) as ContentDNA;
            }
            return null;
        } catch (error) {
            console.error("Erro ao gerar DNA do conteúdo:", error);
            return null;
        }
    }
}
