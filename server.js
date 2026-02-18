
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './backend/services/audit/trafficLogger.js';
import { trafficLogger } from './backend/middleware/trafficLogger.js';
import { apiRouter } from './backend/RotasDoBackEnd/api.js';

// --- Configuração Inicial ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração do Logger ---
const logger = createLogger({ level: process.env.LOG_LEVEL || 'info' });

// --- Verificação de Variáveis de Ambiente ---
logger.info('--- Verificação de Variáveis de Ambiente Essenciais ---');
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_SECRET', 'DATABASE_URL'];
let allVarsOk = true;

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    logger.info(`✅ Variável de ambiente '${varName}' carregada.`);
  } else {
    logger.error(`❌ FATAL: Variável de ambiente obrigatória '${varName}' não definida.`);
    allVarsOk = false;
  }
});

if (!allVarsOk) {
    logger.error('--- A aplicação não pode iniciar devido à falta de variáveis de ambiente. --- ');
    process.exit(1); // Impede o servidor de iniciar
} else {
    logger.info('--- Todas as variáveis de ambiente essenciais foram carregadas. ---');
}
// --- Fim da Verificação ---


// --- Middlewares ---
app.use(express.json()); // Middleware para parsear JSON
app.use(trafficLogger(logger)); // Middleware para logar todo o tráfego

// --- Rotas da API ---
app.use('/api', apiRouter);

// --- Servir Arquivos Estáticos do Frontend ---
const clientDistPath = path.join(__dirname, 'dist');
app.use(express.static(clientDistPath));

// --- Rota Catch-All para SPA ---
app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ message: 'Endpoint não encontrado.' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
});
