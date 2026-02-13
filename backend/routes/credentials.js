
import express from 'express';
import { RepositoryHub } from '../database/RepositoryHub.js.js';
import { z } from 'zod';
import { cryptoService } from '../services/cryptoService.js.js';

const router = express.Router();

// Esquemas de validação
const providerSchema = z.object({ provider: z.string().min(1) });
const saveSchema = providerSchema.extend({ credentials: z.object({}).passthrough() });

/**
 * Middleware para garantir que o usuário está autenticado
 */
const ensureAuthenticated = (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    next();
};

router.use(ensureAuthenticated);

/**
 * @route GET /api/credentials/status
 * @description Retorna uma lista de provedores aos quais o usuário está conectado.
 * Seguro para ser chamado pelo frontend.
 */
router.get('/status', async (req, res) => {
    try {
        const userId = req.user.id;
        const allCredentials = await RepositoryHub.credentials.findAllByUser(userId);
        
        // Retorna apenas os nomes dos provedores, sem nenhuma informação sensível.
        const connectedProviders = allCredentials.map(cred => cred.provider);
        
        res.status(200).json({ connectedProviders });

    } catch (error) {
        console.error('Erro ao buscar status das credenciais:', error);
        res.status(500).json({ error: 'Erro interno ao buscar status das credenciais.' });
    }
});

/**
 * @route POST /api/credentials/get-decrypted
 * @description Busca e descriptografa as credenciais para um provedor específico.
 * Destinado ao uso interno por outros serviços de backend.
 */
router.post('/get-decrypted', async (req, res) => {
    try {
        const validation = providerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        }

        const { provider } = validation.data;
        const userId = req.user.id;

        const record = await RepositoryHub.credentials.findByUserAndProvider({ userId, provider });

        if (!record || !record.credentials) {
            return res.status(404).json({ error: 'Credenciais não encontradas.' });
        }

        // Descriptografa as credenciais antes de retornar
        const decryptedCredentials = JSON.parse(cryptoService.decrypt(record.credentials));

        res.status(200).json({ credentials: decryptedCredentials });

    } catch (error) {
        console.error(`Erro ao buscar credenciais descriptografadas para ${req.body.provider}:`, error);
        res.status(500).json({ error: 'Erro interno ao processar sua solicitação.' });
    }
});

/**
 * @route POST /api/credentials/save
 * @description Salva ou atualiza as credenciais de um provedor.
 */
router.post('/save', async (req, res) => {
    try {
        const validation = saveSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        }

        const { provider, credentials } = validation.data;
        const userId = req.user.id;

        const encryptedCredentials = cryptoService.encrypt(JSON.stringify(credentials));

        await RepositoryHub.credentials.saveOrUpdate({
            userId,
            provider,
            credentials: encryptedCredentials,
        });

        res.status(200).json({ success: true, message: `Credenciais para ${provider} salvas com sucesso.` });

    } catch (error) {
        console.error(`Erro ao salvar credenciais para ${req.body.provider}:`, error);
        res.status(500).json({ error: 'Erro interno ao salvar credenciais.' });
    }
});

/**
 * @route POST /api/credentials/disconnect
 * @description Remove as credenciais de um provedor.
 */
router.post('/disconnect', async (req, res) => {
    try {
        const validation = providerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        }

        const { provider } = validation.data;
        const userId = req.user.id;

        await RepositoryHub.credentials.delete({ userId, provider });

        res.status(200).json({ success: true, message: `Credenciais para ${provider} removidas com sucesso.` });

    } catch (error) {
        console.error(`Erro ao remover credenciais para ${req.body.provider}:`, error);
        res.status(500).json({ error: 'Erro interno ao remover credenciais.' });
    }
});

export default router;
