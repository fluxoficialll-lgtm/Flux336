
import { ContentDNA, Post } from "../../../types";
import { authService } from "../../ServiçoDeAutenticacao/authService";
import { postService } from "@/ServiçosDoFrontend/real/postService";
import { db } from "../database";

export const UserInterestService = {

    /**
     * Determina o DNA de interesse atual do usuário.
     * A estratégia é pegar o DNA do último post que o usuário criou.
     * Futuramente, isso pode ser expandido para um perfil de interesse mais complexo.
     * @returns O ContentDNA mais recente do usuário, ou null se não for encontrado.
     */
    async getCurrentInterestDna(): Promise<ContentDNA | null> {
        const user = authService.getCurrentUser();
        if (!user) {
            return null; // Nenhum usuário logado
        }

        // Busca todos os posts e filtra pelos do usuário que possuem DNA
        const userPosts = db.posts.getAll().filter(
            p => p.authorId === user.id && p.dna
        );

        if (userPosts.length === 0) {
            return null; // Usuário não tem posts com DNA
        }

        // Ordena por data para encontrar o post mais recente
        userPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Retorna o DNA do post mais recente
        return userPosts[0].dna || null;
    }
};