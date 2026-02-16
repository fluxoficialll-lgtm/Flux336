
import express from 'express';

const router = express.Router();

// Rota para a página de mapa de fluxo
router.get('/', (req, res) => {
    // Lógica para renderizar a página do mapa de fluxo
    res.send('Página do Mapa de Fluxo');
});

export { router as fluxmapRoutes };
