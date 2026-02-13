
/**
 * @file ads.js
 * @description
 * Este arquivo define o schema do banco de dados para o sistema de Anúncios (ADS).
 * Ele contém as instruções SQL para criar e estruturar as tabelas necessárias
 * para armazenar informações sobre os anúncios e os eventos associados a eles.
 * 
 * Tabelas definidas:
 * - ads: Tabela principal que armazena cada anúncio como um registro. O campo `data` (JSONB)
 *   é flexível para guardar metadados como título, conteúdo, link e o crucial `targetDna`.
 * 
 * - ad_events: Rastreia interações com os anúncios, como visualizações (`view`), cliques (`click`)
 *   e conversões (`conversion`). Essencial para analytics e otimização de campanhas.
 *
 * - Índices (idx_...): Otimizações de banco de dados para garantir que as buscas por dono do anúncio,
 *   ID do anúncio e tipo de evento sejam rápidas e eficientes.
 */

export const adsSchema = `
    CREATE TABLE IF NOT EXISTS ads (
        id TEXT PRIMARY KEY,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ad_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ad_id TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        event_type TEXT NOT NULL, -- 'view', 'click', 'conversion'
        value NUMERIC(10,2) DEFAULT 0,
        metadata JSONB, -- device, location, placement
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_ads_owner ON ads(owner_id);
    CREATE INDEX IF NOT EXISTS idx_ad_events_ad_id ON ad_events(ad_id);
    CREATE INDEX IF NOT EXISTS idx_ad_events_type ON ad_events(event_type);
`;
