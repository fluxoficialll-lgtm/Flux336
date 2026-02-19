
import { Post, User } from '@/types';
import { db } from '@/database';
import { ScoredItem, EngineContext } from '@/ServiçosDoFrontend/ServiçoDeDescober../types';

// O FeedEngine é responsável por classificar e ordenar as postagens no feed de um usuário.
// Ele utiliza um algoritmo que leva em consideração o relacionamento social,
// o quão recente é a postagem e o nível de engajamento que ela recebeu.
export class FeedEngine {
    // Estes são os pesos que definem a importância de cada fator no cálculo do score.
    private static WEIGHTS = {
        FOLLOW_BONUS: 5000,           // Um grande bônus para postagens de pessoas que o usuário segue.
        RECENCY_BASE: 2000,           // A base para o cálculo de recência.
        ENGAGEMENT_MULTIPLIER: 150, // Multiplicador para o engajamento (curtidas e comentários).
        DECAY_FACTOR: 1.8             // Fator de decaimento: quanto maior, mais rápido o score de uma postagem antiga diminui.
    };

    /**
     * O método `rank` calcula um "score" para cada postagem e as ordena com base nesse score.
     * @param posts - A lista de postagens a serem classificadas.
     * @param context - O contexto do mecanismo, que inclui o usuário atual.
     * @returns A lista de postagens ordenadas.
     */
    public static rank(posts: Post[], context: EngineContext): Post[] {
        const now = Date.now();
        const relationships = db.relationships.getAll();
        // Obtém a lista de IDs de usuários que o usuário atual segue.
        const myFollowing = context.user ?
            relationships.filter(r => r.followerId === context.user?.id && r.status === 'accepted').map(r => r.followingId) :
            [];

        // Calcula o score para cada postagem.
        const scored = posts.map(post => {
            let score = 1000; // Score base inicial para cada postagem.

            // 1. Bônus de Relacionamento (Grafo Social)
            // Se o autor da postagem é alguém que o usuário segue, um grande bônus é adicionado.
            if (myFollowing.includes(post.authorId)) {
                score += this.WEIGHTS.FOLLOW_BONUS;
            }

            // 2. Cálculo de Recência (Decaimento Temporal)
            // Calcula a "idade" da postagem em horas.
            const ageHours = Math.max(0, (now - post.timestamp) / (1000 * 60 * 60));
            // Adiciona um score de recência que diminui com o tempo.
            score += this.WEIGHTS.RECENCY_BASE / Math.pow(ageHours + 1, this.WEIGHTS.DECAY_FACTOR);

            // 3. Bônus de Engajamento Social
            // Calcula o engajamento com base no número de curtidas e comentários (comentários têm um peso maior).
            const interactions = (post.likes * 2) + (post.comments * 5);
            score += interactions * this.WEIGHTS.ENGAGEMENT_MULTIPLIER;

            return { item: post, score };
        });

        // Ordena as postagens do maior para o menor score e retorna a lista ordenada.
        return scored.sort((a, b) => b.score - a.score).map(s => s.item);
    }
}
