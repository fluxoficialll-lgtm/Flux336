
import { Post } from '../../../types';
import { GoogleGenAI } from "@google/genai"; // Importa a biblioteca de IA do Google (Gemini).
import { EngineContext } from '@/ServiçosDoFrontend/ServiçoDeDescober../types';

// O ReelsEngine é projetado para classificar e ordenar vídeos curtos (Reels).
// Ele foca em três pilares: o potencial de viralização, a afinidade do conteúdo com os
// interesses do usuário (usando IA) e a taxa de retenção do vídeo.
export class ReelsEngine {
    // Pesos que definem a importância de cada fator no score de um Reel.
    private static WEIGHTS = {
        VIRAL_VELOCITY: 300,   // Multiplicador para o número de visualizações (velocidade viral).
        WATCH_TIME_BOOST: 1000,  // Bônus baseado na retenção (proporção de curtidas por visualização).
        AI_AFFINITY: 2500      // Multiplicador para a afinidade semântica calculada pela IA.
    };

    /**
     * Utiliza a IA do Gemini para analisar e pontuar a afinidade entre o conteúdo de um Reel
     * e a biografia (interesses) de um usuário.
     * @param postText - O texto/descrição do Reel.
     * @param userBio - A biografia do usuário, usada como proxy para seus interesses.
     * @returns Uma pontuação de afinidade de 1 a 10.
     */
    private static async getSemanticAffinity(postText: string, userBio: string): Promise<number> {
        // Se a chave da API ou a bio do usuário não estiverem disponíveis, retorna uma pontuação neutra.
        if (!process.env.API_KEY || !userBio) return 5;

        try {
            // Inicializa o cliente da IA do Google.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Envia um prompt para o modelo Gemini, pedindo para analisar a afinidade.
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analise a afinidade entre o post: \"${postText}\" e o interesse: \"${userBio}\". Responda apenas um número de 1 a 10.`,
            });
            // Converte a resposta de texto do modelo para um número.
            return parseInt(response.text?.trim() || "5");
        } catch (e) {
            // Em caso de erro na chamada da IA, retorna uma pontuação neutra.
            return 5;
        }
    }

    /**
     * O método `rank` calcula um "score" para cada Reel e os ordena.
     * @param reels - A lista de Reels a serem classificados.
     * @param context - O contexto do mecanismo, incluindo o usuário atual.
     * @returns A lista de Reels ordenada.
     */
    public static async rank(reels: Post[], context: EngineContext): Promise<Post[]> {
        // Usa Promise.all para processar os cálculos de score, incluindo a chamada assíncrona da IA.
        const scored = await Promise.all(reels.map(async reel => {
            let score = 5000; // Score base inicial.

            // 1. Velocidade Viral (Visualizações)
            // O número de visualizações é um forte indicador de popularidade.
            score += (reel.views * this.WEIGHTS.VIRAL_VELOCITY);

            // 2. Afinidade com IA (Processamento limitado aos primeiros 10 itens por performance)
            // Se o usuário tem uma biografia, usa a IA para calcular a afinidade do Reel com seus interesses.
            // A verificação é limitada aos 10 primeiros reels para não sobrecarregar as chamadas à API.
            if (context.user?.profile?.bio && reels.indexOf(reel) < 10) {
                const affinity = await this.getSemanticAffinity(reel.text, context.user.profile.bio);
                score += (affinity * this.WEIGHTS.AI_AFFINITY);
            }

            // 3. Retenção (Proporção de Curtidas por Visualização)
            // Uma alta proporção de curtidas em relação às visualizações sugere que os espectadores gostaram do conteúdo.
            const retention = reel.views > 0 ? (reel.likes / reel.views) : 0;
            score += (retention * this.WEIGHTS.WATCH_TIME_BOOST);

            return { item: reel, score };
        }));

        // Ordena os Reels do maior para o menor score e retorna a lista.
        return scored.sort((a, b) => b.score - a.score).map(s => s.item);
    }
}
