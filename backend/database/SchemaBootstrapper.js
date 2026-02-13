
import { query } from './pool.js.js';

// Importação centralizada de todos os schemas estruturais
import { usersSchema } from './schemas/users.js.js';
import { groupsSchema } from './schemas/groups.js.js';
import { financialSchema } from './schemas/financial.js.js';
import { adsSchema } from './schemas/ads.js.js';
import { feesSchema } from './schemas/fees.js.js';
import { vipSchema } from './schemas/vip.js.js';
import { postsSchema } from './schemas/posts.js.js';
import { chatsSchema } from './schemas/chats.js.js';
import { marketplaceSchema } from './schemas/marketplace.js.js';
import { relationshipsSchema } from './schemas/relationships.js.js';
import { reportsSchema } from './schemas/reports.js.js';
import { interactionsSchema } from './schemas/interactions.js.js';
import { auditSchema } from './schemas/audit.js.js';
import { settingsSchema } from './schemas/settings.js.js';
import { paymentsSchema } from './schemas/payments.js.js'; // <-- Adicionado
import { up as paymentProviderCredentialsSchema } from './schemas/PaymentProviderCredentialsSchema.js.js'; 

export const SchemaBootstrapper = {
    /**
     * Executa a sequência de bootstrapping do banco de dados.
     */
    async run() {
        console.log("🔄 DB: Inicializando Motor de Migração...");
        
        try {
            // 1. Requisitos de Sistema
            await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
            
            // 2. Registro de Tabelas
            const schemas = [
                usersSchema, groupsSchema, postsSchema,
                chatsSchema, marketplaceSchema, relationshipsSchema,
                reportsSchema, interactionsSchema, vipSchema,    
                financialSchema, adsSchema, feesSchema, auditSchema,
                settingsSchema, paymentProviderCredentialsSchema, paymentsSchema // <-- Adicionado
            ];

            for (const sql of schemas) { 
                try {
                    await query(sql); 
                } catch (schemaError) {
                    console.warn(`⚠️ [Bootstrapper] Aviso em schema: ${schemaError.message.substring(0, 60)}...`);
                }
            }

            // 3. Integridade e Triggers Complexas
            await this.setupTriggers();
            
            console.log("✅ DB: Estrutura física e lógica verificada.");
        } catch (e) {
            console.error("❌ DB: Falha Crítica no Bootstrapper:", e.message);
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
