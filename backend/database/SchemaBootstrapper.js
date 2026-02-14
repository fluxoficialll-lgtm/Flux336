
import { query } from './pool.js';

// Importação centralizada de todos os schemas estruturais
import { usersSchema } from './schemas/users.js';
import { groupsSchema } from './schemas/groups.js';
import { financialSchema } from './schemas/financial.js';
import { adsSchema } from './schemas/ads.js';
import { feesSchema } from './schemas/fees.js';
import { vipSchema } from './schemas/vip.js';
import { postsSchema } from './schemas/posts.js';
import { chatsSchema } from './schemas/chats.js';
import { marketplaceSchema } from './schemas/marketplace.js';
import { relationshipsSchema } from './schemas/relationships.js';
import { reportsSchema } from './schemas/reports.js';
import { interactionsSchema } from './schemas/interactions.js';
import { auditSchema } from './schemas/audit.js';
import { settingsSchema } from './schemas/settings.js';
import { paymentsSchema } from './schemas/payments.js';
import { reelsSchema } from './schemas/reels.js';
import { up as paymentProviderCredentialsSchema } from './schemas/PaymentProviderCredentialsSchema.js'; 

// Definições de tipos ENUM como constantes SQL
const createEnumProductCondition = `CREATE TYPE product_condition AS ENUM ('new', 'used', 'refurbished')`;
const createEnumRelationshipStatus = `CREATE TYPE relationship_status AS ENUM ('following', 'follower', 'friends', 'blocked')`;
const createEnumTransactionType = `CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'purchase', 'refund')`;

export const SchemaBootstrapper = {
    /**
     * Executa a sequência de bootstrapping do banco de dados.
     */
    async run() {
        console.log("🔄 DB: Inicializando Motor de Migração...");
        
        try {
            // 1. Requisitos de Sistema e Tipos
            const setupSQL = [
                `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
                createEnumProductCondition,
                createEnumRelationshipStatus,
                createEnumTransactionType
            ];

            // 2. Registro de Tabelas em Ordem de Dependência
            const tableSchemas = [
                usersSchema, 
                groupsSchema, 
                postsSchema,
                chatsSchema, 
                marketplaceSchema, 
                reelsSchema,
                relationshipsSchema,
                interactionsSchema, 
                vipSchema,
                financialSchema, 
                adsSchema,
                feesSchema,
                paymentsSchema, 
                paymentProviderCredentialsSchema,
                reportsSchema, 
                auditSchema,
                settingsSchema
            ];

            // Concatena todas as queries SQL na ordem correta
            const allQueries = [...setupSQL, ...tableSchemas];

            for (const sql of allQueries) { 
                try {
                    await query(sql); 
                } catch (schemaError) {
                    // Apenas avisa sobre erros de schema (ex: tipo já existe) e continua
                    console.warn(`⚠️ [Bootstrapper] Aviso em schema: ${schemaError.message.substring(0, 120)}...`);
                }
            }

            // 3. Integridade e Triggers Complexas
            await this.setupTriggers();
            
            console.log("✅ DB: Estrutura física e lógica verificada.");
        } catch (e) {
            console.error("❌ DB: Falha Crítica no Bootstrapper:", e.message);
            // Lançar o erro aqui é importante para parar a inicialização se algo crítico falhar.
            throw e; 
        }
    },

    async setupTriggers() {
        // Trigger para contagem automática de membros no Postgres
        await query(`
            CREATE OR REPLACE FUNCTION update_member_count()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (TG_OP = 'INSERT') THEN
                    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
                ELSIF (TG_OP = 'DELETE') THEN
                    UPDATE groups SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.group_id;
                END IF;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_update_member_count ON vip_access;
            CREATE TRIGGER trg_update_member_count
            AFTER INSERT OR DELETE ON vip_access
            FOR EACH ROW EXECUTE FUNCTION update_member_count();
        `);
    }
};
