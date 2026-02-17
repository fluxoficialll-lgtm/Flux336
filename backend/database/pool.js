
// Arquivo: pool.js
// Função: Gerencia o pool de conexões com o banco de dados PostgreSQL.
//
// Um pool de conexões é um cache de conexões de banco de dados ativas.
// Reutilizar conexões existentes melhora significativamente a performance e a escalabilidade da aplicação,
// evitando o custo computacional de estabelecer uma nova conexão para cada consulta.

// Importa a classe Pool do driver 'pg' do Node.js para PostgreSQL.
import pg from 'pg';
const { Pool } = pg;

// ====================================================================================
// Validação da Configuração Essencial
// ====================================================================================

// A aplicação depende de uma string de conexão fornecida pela variável de ambiente DATABASE_URL.
if (!process.env.DATABASE_URL) {
    // Uma falha em carregar esta variável é um erro fatal de configuração que impede a inicialização do serviço.
    console.error("❌ ERRO CRÍTICO: A variável de ambiente DATABASE_URL não foi definida.");
    // Em um ambiente de produção, isso justificaria encerrar o processo: process.exit(1);
}

// ====================================================================================
// Instanciação e Configuração do Pool
// ====================================================================================

// Instancia e exporta o pool de conexões que será compartilhado por toda a aplicação.
export const pool = new Pool({
    // Define o alvo da conexão utilizando a string fornecida pela variável de ambiente.
    connectionString: process.env.DATABASE_URL,

    // Configura o uso de SSL. Em produção, a conexão segura é mandatória.
    // `rejectUnauthorized: false` é frequentemente necessário em plataformas como serviço (PaaS) 
    // que gerenciam certificados SSL de forma interna.
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,

    // --- Parâmetros de Performance e Resiliência ---

    // Tempo máximo (em ms) que o pool aguardará por uma conexão disponível antes de lançar um erro.
    connectionTimeoutMillis: 15000, // 15 segundos

    // Tempo máximo (em ms) que uma conexão pode permanecer ociosa no pool antes de ser fechada e removida.
    // Ajuda a liberar recursos no servidor de banco de dados.
    idleTimeoutMillis: 30000, // 30 segundos

    // Número máximo de conexões simultâneas que o pool pode manter.
    // O valor é obtido da variável de ambiente DB_POOL_MAX para flexibilidade entre ambientes (dev/prod),
    // com um padrão conservador de 10 se não for especificado.
    max: parseInt(process.env.DB_POOL_MAX || '10', 10)
});

// ====================================================================================
// Exportação da Função de Consulta Abstraída
// ====================================================================================

// Exporta uma função 'query' simplificada para abstrair a interação direta com o pool.
// Isso cria uma interface consistente para a execução de consultas em toda a aplicação,
// centralizando a lógica de acesso a dados e facilitando a manutenção.
export const query = (text, params) => pool.query(text, params);

// Log de inicialização para confirmar a configuração do pool e seu tamanho máximo.
console.log(`🔌 DB: Pool de conexões configurado. Máximo de conexões: ${pool.options.max}.`);
