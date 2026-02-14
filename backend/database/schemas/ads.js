
export const adsSchema = `
    -- 📝 Habilita a extensão "uuid-ossp" se ainda não estiver habilitada, para gerar IDs únicos.
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- 📝 Tabela principal de anúncios. Armazena a configuração geral de cada anúncio.
    CREATE TABLE IF NOT EXISTS ads (
        -- 📝 ID único universal para o anúncio.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário (proprietário) que criou o anúncio. Chave estrangeira para a tabela 'users'.
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Nome interno do anúncio para identificação na plataforma.
        name TEXT NOT NULL,
        -- 📝 Status atual do anúncio. Ex: 'draft' (rascunho), 'active' (ativo), 'paused' (pausado).
        status TEXT NOT NULL DEFAULT 'draft',
        -- 📝 Data e hora de início da veiculação do anúncio.
        start_date TIMESTAMP,
        -- 📝 Data e hora de término da veiculação do anúncio.
        end_date TIMESTAMP,
        -- 📝 Orçamento total alocado para a campanha deste anúncio.
        budget NUMERIC(15,2),
        -- 📝 Critérios de segmentação do público-alvo em formato JSON. Ex: idade, interesses, localização.
        target_audience JSONB,
        -- 📝 Conteúdo criativo do anúncio em formato JSON. Ex: título, texto, URL da imagem/vídeo.
        creative JSONB,
        -- 📝 Data e hora de criação do registro do anúncio.
        created_at TIMESTAMP DEFAULT NOW(),
        -- 📝 Data e hora da última atualização do registro do anúncio.
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 📝 Tabela para campanhas de anúncios. Uma campanha pode agrupar vários anúncios com um objetivo comum.
    CREATE TABLE IF NOT EXISTS ad_campaigns (
        -- 📝 ID único universal para a campanha.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do anúncio ao qual esta campanha está associada.
        ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
        -- 📝 Nome da campanha.
        name TEXT NOT NULL,
        -- 📝 Objetivo principal da campanha. Ex: 'reach' (alcance), 'traffic' (tráfego), 'conversions' (conversões).
        objective TEXT NOT NULL,
        -- 📝 Data e hora de criação da campanha.
        created_at TIMESTAMP DEFAULT NOW(),
        -- 📝 Data e hora da última atualização da campanha.
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 📝 Tabela para registrar eventos relacionados aos anúncios (impressões, cliques, etc.).
    CREATE TABLE IF NOT EXISTS ad_events (
        -- 📝 ID único universal para o evento.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do anúncio que gerou o evento.
        ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
        -- 📝 ID do usuário que interagiu com o anúncio (se aplicável).
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 Tipo do evento. Ex: 'view' (visualização), 'click' (clique), 'conversion' (conversão).
        event_type TEXT NOT NULL,
        -- 📝 Valor monetário associado ao evento (ex: receita de uma conversão).
        value NUMERIC(10,2) DEFAULT 0,
        -- 📝 Metadados adicionais em JSON. Ex: dispositivo, localização do usuário, posicionamento do anúncio.
        metadata JSONB,
        -- 📝 Data e hora em que o evento ocorreu.
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- 📝 Cria um índice na coluna 'owner_id' da tabela 'ads' para otimizar buscas de anúncios por usuário.
    CREATE INDEX IF NOT EXISTS idx_ads_owner ON ads(owner_id);
    -- 📝 Cria um índice na coluna 'ad_id' da tabela 'ad_events' para otimizar buscas de eventos por anúncio.
    CREATE INDEX IF NOT EXISTS idx_ad_events_ad_id ON ad_events(ad_id);
    -- 📝 Cria um índice na coluna 'event_type' da tabela 'ad_events' para otimizar buscas de eventos por tipo.
    CREATE INDEX IF NOT EXISTS idx_ad_events_type ON ad_events(event_type);
`;
