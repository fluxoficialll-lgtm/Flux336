
'use strict';

const { commentSchema, commentTriggers } = require('../schemas/commentSchema');

/**
 * @fileoverview Migração para criar a tabela 'comments' e seus gatilhos associados.
 * Utiliza o schema definido em commentSchema.js.
 */

module.exports = {
  /**
   * Executa a migração (para cima).
   * Cria a tabela de comentários e os gatilhos.
   * @param {import('pg-promise').IDatabase} db - Instância do banco de dados.
   */
  async up(db) {
    await db.none(commentSchema);
    await db.none(commentTriggers);
    console.log('Migration UP: Tabela de comentários e gatilhos criados com sucesso.');
  },

  /**
   * Reverte a migração (para baixo).
   * Remove a tabela de comentários.
   * @param {import('pg-promise').IDatabase} db - Instância do banco de dados.
   */
  async down(db) {
    await db.none('DROP TABLE IF EXISTS comments;');
    console.log('Migration DOWN: Tabela de comentários removida.');
  }
};
