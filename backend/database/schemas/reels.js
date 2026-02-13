
const Joi = require('joi');

/**
 * Esquema de validação para a criação e atualização de um Reel.
 * Define a estrutura e os tipos de dados de um documento de Reel no Firestore.
 */
const reelsSchema = Joi.object({
    // --- Campos Obrigatórios ---

    // ID do usuário que criou o Reel. Deve ser uma string.
    userId: Joi.string().required().description("ID do usuário que postou o Reel."),

    // URL do vídeo armazenado no serviço de nuvem (ex: Cloudflare R2).
    videoUrl: Joi.string().uri().required().description("URL do vídeo do Reel."),

    // --- Campos Opcionais ---

    // Descrição ou legenda do Reel. Permite string vazia.
    description: Joi.string().allow('').description("Legenda do Reel."),

    // Caminho do arquivo no serviço de armazenamento, para facilitar a exclusão.
    storagePath: Joi.string().description("Caminho do arquivo no bucket de armazenamento."),
    
    // --- Campos Gerenciados pelo Sistema ---

    // Array com os IDs dos usuários que curtiram o Reel.
    likes: Joi.array().items(Joi.string()).default([]).description("Lista de IDs de usuários que curtiram."),

    // Contagem de comentários para acesso rápido.
    commentsCount: Joi.number().integer().min(0).default(0).description("Número de comentários no Reel."),

    // Contagem de visualizações.
    viewsCount: Joi.number().integer().min(0).default(0).description("Número de visualizações do Reel."),

    // Timestamp da criação do documento.
    createdAt: Joi.date().timestamp().default(() => new Date()).description("Data de criação do Reel."),

    // Timestamp da última atualização.
    updatedAt: Joi.date().timestamp().default(() => new Date()).description("Data da última atualização do Reel.")
});

module.exports = reelsSchema;
