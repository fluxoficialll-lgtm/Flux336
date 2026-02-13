
const { db } = require('../config');

/**
 * Repositório para gerenciar as operações de Reels no banco de dados (Firestore).
 */
class ReelsRepository {
    constructor() {
        this.collection = db.collection('reels');
    }

    /**
     * Cria um novo Reel no banco de dados.
     * @param {object} reelData - Os dados do Reel a serem criados.
     * @returns {Promise<string>} O ID do Reel recém-criado.
     */
    async create(reelData) {
        const docRef = await this.collection.add(reelData);
        return docRef.id;
    }

    /**
     * Busca um Reel pelo seu ID.
     * @param {string} reelId - O ID do Reel.
     * @returns {Promise<object|null>} O objeto do Reel ou null se não for encontrado.
     */
    async findById(reelId) {
        const doc = await this.collection.doc(reelId).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Busca todos os Reels de um usuário específico.
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<Array<object>>} Uma lista de Reels do usuário.
     */
    async findByUser(userId) {
        const snapshot = await this.collection.where('userId', '==', userId).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    /**
     * Atualiza um Reel.
     * @param {string} reelId - O ID do Reel a ser atualizado.
     * @param {object} updateData - Os campos a serem atualizados.
     * @returns {Promise<void>}
     */
    async update(reelId, updateData) {
        await this.collection.doc(reelId).update(updateData);
    }

    /**
     * Deleta um Reel.
     * @param {string} reelId - O ID do Reel a ser deletado.
     * @returns {Promise<void>}
     */
    async delete(reelId) {
        await this.collection.doc(reelId).delete();
    }

    /**
     * Adiciona um like a um Reel.
     * @param {string} reelId - O ID do Reel.
     * @param {string} userId - O ID do usuário que deu o like.
     * @returns {Promise<void>}
     */
    async addLike(reelId, userId) {
        // Esta é uma implementação de exemplo. Você pode querer usar transações
        // ou FieldValue.arrayUnion para uma abordagem mais robusta.
        const reel = await this.findById(reelId);
        if (reel && !reel.likes?.includes(userId)) {
            const likes = [...(reel.likes || []), userId];
            await this.update(reelId, { likes });
        }
    }
}

module.exports = new ReelsRepository();
