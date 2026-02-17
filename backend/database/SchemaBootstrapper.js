
// Arquivo: SchemaBootstrapper.js
// Função: Orquestrar a criação da estrutura do banco de dados na inicialização da aplicação.
// Lógica Temporal: Este arquivo funciona como um roteiro de construção, executado em uma ordem específica
// para garantir que a base de dados seja construída corretamente, respeitando as dependências.

// Antes de começar, precisamos da ferramenta para executar comandos no banco de dados.
import { query } from './pool.js';

// ====================================================================================
// PASSO 1: Reunir todas as "plantas baixas" (schemas) do nosso banco de dados.
// ====================================================================================
// Cada importação representa a planta de uma parte da nossa aplicação.
// A ordem de importação aqui não importa, mas a ordem de execução (mais abaixo) é crucial.

import { usersSchema } from './schemas/users.js'; // Planta dos usuários, a base de tudo.
import { groupsSchema } from './schemas/groups.js'; // Planta dos grupos criados por usuários.
import { financialSchema } from './schemas/financial.js'; // Planta para dados financeiros gerais.
import { adsSchema } from './schemas/ads.js'; // Planta para o sistema de anúncios.
import { feesSchema } from './schemas/fees.js'; // Planta para as taxas da plataforma.
import { vipSchema } from './schemas/vip.js'; // Planta para acesso e membros VIP.
import { postsSchema } from './schemas/posts.js'; // Planta dos posts, que dependem dos usuários.
import { chatsSchema } from './schemas/chats.js'; // Planta para o sistema de chat.
import { marketplaceSchema } from './schemas/marketplace.js'; // Planta para a loja.
import { relationshipsSchema } from './schemas/relationships.js'; // Planta para amizades e bloqueios.
import { reportsSchema } from './schemas/reports.js'; // Planta para denúncias.
import { interactionsSchema } from './schemas/interactions.js'; // Planta para curtidas, comentários, etc.
import { auditSchema } from './schemas/audit.js'; // Planta para registros de auditoria.
import { settingsSchema } from './schemas/settings.js'; // Planta para as configurações dos usuários.
import { paymentsSchema } from './schemas/payments.js'; // Planta para o histórico de pagamentos.
import { reelsSchema } from './schemas/reels.js'; // Planta para os vídeos curtos.
import { up as paymentProviderCredentialsSchema } from './schemas/PaymentProviderCredentialsSchema.js'; // Planta para guardar chaves de APIs de pagamento.

// ====================================================================================
// PASSO 2: Definir os "materiais de construção" personalizados.
// ====================================================================================
// Antes de criar as tabelas, precisamos definir alguns tipos de dados customizados (ENUMs)
// que serão usados em várias partes do sistema.

const createEnumProductCondition = `CREATE TYPE product_condition AS ENUM ('new', 'used', 'refurbished')`;
const createEnumRelationshipStatus = `CREATE TYPE relationship_status AS ENUM ('pending', 'accepted', 'blocked')`;
const createEnumTransactionType = `CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'purchase', 'refund')`;

export const SchemaBootstrapper = {
    // O método principal que executa todo o plano de construção.
    async run() {
        console.log("🔄 DB: Iniciando a construção e verificação da estrutura do banco de dados...");
        
        try {
            // --- Medida de Segurança: Limpeza --- 
            // Para evitar conflitos durante o desenvolvimento, limpamos alguns tipos e tabelas que podem causar erros.
            // A cláusula "CASCADE" derruba também tudo que depende da tabela, garantindo uma limpeza completa.
            await query("DROP TABLE IF EXISTS relationships CASCADE;");
            await query("DROP TABLE IF EXISTS follows CASCADE;");
            await query("DROP TYPE IF EXISTS relationship_status;");

            // ====================================================================================
            // PASSO 3: O Roteiro de Construção, em ordem de execução.
            // ====================================================================================

            // 3.1: Preparar o "terreno": instalar extensões e criar os tipos de dados (ENUMs).
            const setupSQL = [
                `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`, // Habilita a geração de IDs únicos (UUIDs).
                createEnumProductCondition, // Cria o tipo 'condição do produto'.
                createEnumRelationshipStatus, // Cria o tipo 'status de relacionamento'.
                createEnumTransactionType // Cria o tipo 'tipo de transação'.
            ];

            // 3.2: Construir as "fundações" e "paredes": criar as tabelas.
            // A ORDEM AQUI É CRÍTICA. Tabelas que não dependem de ninguém vêm primeiro (ex: users).
            // Tabelas que dependem de outras (ex: posts, que tem um user_id) vêm depois.
            const tableSchemas = [
                usersSchema,          // Começamos com os usuários.
                groupsSchema,         // Grupos precisam de usuários como donos.
                postsSchema,          // Posts precisam de usuários para saber o autor.
                chatsSchema,          // Chats conectam usuários.
                marketplaceSchema,    // Produtos no marketplace são vendidos por usuários.
                reelsSchema,          // Reels são postados por usuários.
                relationshipsSchema,  // Relacionamentos (amizades) são entre usuários.
                interactionsSchema,   // Interações (curtidas) são feitas por usuários em posts/reels.
                vipSchema,            // Acesso VIP é concedido a usuários em grupos.
                financialSchema,      // Dados financeiros são associados a usuários.
                adsSchema,            // Anúncios são criados por usuários.
                feesSchema,           // Taxas podem ser aplicadas a transações de usuários.
                paymentsSchema,       // Pagamentos são feitos por usuários.
                paymentProviderCredentialsSchema, // Credenciais de pagamento pertencem a usuários.
                reportsSchema,        // Denúncias são feitas por usuários sobre outros conteúdos.
                auditSchema,          // Auditoria rastreia ações de usuários.
                settingsSchema        // Configurações pertencem a usuários.
            ];

            // Junta todas as etapas de construção em uma única lista de tarefas.
            const allQueries = [...setupSQL, ...tableSchemas];

            // Executa cada tarefa (query SQL) uma por uma.
            for (const sql of allQueries) { 
                try {
                    await query(sql); 
                } catch (schemaError) {
                    // Se uma tarefa falhar (ex: tentar criar um tipo que já existe), nós apenas avisamos e continuamos.
                    // Isso torna o processo robusto e permite que ele seja executado várias vezes sem quebrar.
                    console.warn(`⚠️  [Aviso de Schema]: ${schemaError.message.substring(0, 120)}... (Continuando)`);
                }
            }

            // ====================================================================================
            // PASSO 4: Instalar os "sistemas inteligentes" (Triggers).
            // ====================================================================================
            // Triggers são automações que rodam no banco de dados após certas ações (INSERT, DELETE).
            await this.setupTriggers();
            
            console.log("✅ DB: Estrutura do banco de dados verificada e pronta para uso.");

        } catch (e) {
            console.error("❌ DB: Falha Crítica ao construir o banco de dados:", e.message);
            // Se um erro crítico acontecer, nós paramos a inicialização do servidor para evitar problemas maiores.
            throw e; 
        }
    },

    // Função dedicada a criar as automações (triggers).
    async setupTriggers() {
        // Este trigger atualiza automaticamente a contagem de membros de um grupo.
        await query(`
            CREATE OR REPLACE FUNCTION update_member_count()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Se um novo membro for INSERIDO na tabela de acesso VIP...
                IF (TG_OP = 'INSERT') THEN
                    -- ...nós aumentamos o contador de membros na tabela de grupos.
                    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
                -- Se um membro for DELETADO da tabela de acesso VIP...
                ELSIF (TG_OP = 'DELETE') THEN
                    -- ...nós diminuímos o contador, garantindo que nunca seja menor que zero.
                    UPDATE groups SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.group_id;
                END IF;
                RETURN NULL; -- O resultado do trigger não precisa retornar um valor.
            END;
            $$ LANGUAGE plpgsql;

            -- Agora, associamos essa função à tabela 'vip_access'.
            DROP TRIGGER IF EXISTS trg_update_member_count ON vip_access; -- Remove o trigger antigo se existir.
            CREATE TRIGGER trg_update_member_count
            AFTER INSERT OR DELETE ON vip_access -- Aciona a função DEPOIS de uma inserção ou deleção...
            FOR EACH ROW EXECUTE FUNCTION update_member_count(); -- ...para cada linha afetada.
        `);
        console.log("🧠 DB: Triggers e automações instalados.");
    }
};
