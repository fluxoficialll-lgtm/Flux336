
import express from 'express';

const router = express.Router();

// Rota para fornecer configurações de autenticação para o frontend.
// Isso resolve o erro 404 em /auth/config que impedia o carregamento da página de login.
router.get('/config', (req, res) => {
    // Envia as variáveis de ambiente necessárias para o cliente, como o ID do Cliente Google.
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
});

export default router;
