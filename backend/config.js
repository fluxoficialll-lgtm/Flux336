
import dotenv from 'dotenv';

// A variável NODE_ENV é uma convenção padrão para definir o ambiente.
// Serviços como Render e Vercel a configuram automaticamente como 'production'.
const isProduction = process.env.NODE_ENV === 'production';

// Se NÃO estivermos em produção (ou seja, estamos em desenvolvimento local),
// carregamos as variáveis de ambiente de um arquivo .env na raiz do projeto.
if (!isProduction) {
  dotenv.config();
}

/**
 * Objeto de configuração centralizado.
 * Ele extrai as variáveis de 'process.env', que foram preenchidas
 * pelo .env (em dev) ou pelo serviço de hospedagem (em prod).
 * Isso fornece um único local para gerenciar as chaves que a aplicação espera.
 */
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  
  // Chaves de APIs e Serviços
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  
  // URLs da Aplicação (exemplo)
  CORS_ORIGIN: isProduction 
    ? ['https://SEU_DOMINIO.com', 'https://www.SEU_DOMINIO.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],

  // Adicione outras variáveis de ambiente que sua aplicação necessita aqui.
  // Ex: DATABASE_URL: process.env.DATABASE_URL
};

// Verificações de Sanidade (Opcional, mas recomendado)
// Isso ajuda a pegar erros de configuração cedo durante a inicialização.
if (!config.GOOGLE_CLIENT_ID) {
  console.warn('AVISO: A variável de ambiente GOOGLE_CLIENT_ID não está definida. O login com Google não funcionará.');
}

if (!config.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.warn('AVISO: A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida. A autenticação do Firebase Admin pode falhar.');
}
