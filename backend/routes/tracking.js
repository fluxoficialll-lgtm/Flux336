
import express from 'express';
import { facebookCapi } from '../services/facebookCapi.js.js';
import { dbManager } from '../databaseManager.js.js';

const router = express.Router();

/**
 * POST /api/tracking/capi
 * Hub universal para eventos Server-Side.
 */
router.post('/capi', async (req, res) => {
    try {
        const { platform, pixelId, accessToken, eventName, eventData, userData, eventId, url } = req.body;
        
        // Atualmente focado em Meta, mas estruturado para expansão
        if (platform === 'meta' || !platform) {
            const result = await facebookCapi.sendEvent({
                pixelId,
                accessToken,
                eventName,
                eventData,
                userData,
                eventId,
                url
            });
            return res.json({ success: true, platform: 'meta', trace_id: result.fb_trace_id });
        }

        // Exemplo de expansão futura:
        // if (platform === 'tiktok') { return tiktokCapi.send(...) }

        res.status(400).json({ error: "PLATFORM_NOT_SUPPORTED" });
    } catch (e) {
        console.warn(`[Tracking Hub Error]: ${e.message}`);
        // Retornamos 202 para não travar o frontend em caso de erro na API de terceiros
        res.status(202).json({ status: "FAILED", error: e.message });
    }
});

/**
 * GET /api/tracking/pixel-info
 */
router.get('/pixel-info', async (req, res) => {
    try {
        const { ref } = req.query;
        if (!ref) return res.status(400).json({ error: "REF_REQUIRED" });

        const user = await dbManager.users.findByEmail(ref) || await dbManager.users.findByHandle(ref);
        
        if (user && user.marketingConfig?.pixelId) {
            return res.json({ 
                pixelId: user.marketingConfig.pixelId,
                tiktokId: user.marketingConfig.tiktokId // Exemplo de suporte a múltiplos IDs por usuário
            });
        }

        res.json({ pixelId: process.env.VITE_PIXEL_ID || "" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
