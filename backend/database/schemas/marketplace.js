
export const marketplaceSchema = `
    -- 📝 Cria um tipo enumerado para a condição de um produto (novo, usado, etc.).
    CREATE TYPE product_condition AS ENUM ('new', 'used_like_new', 'used_good', 'used_fair');
    -- 📝 Cria um tipo enumerado para o status de um anúncio no marketplace.
    CREATE TYPE product_status AS ENUM ('available', 'sold', 'pending', 'expired');

    -- 📝 Tabela para os produtos ou anúncios do marketplace.
    CREATE TABLE IF NOT EXISTS marketplace_products (
        -- 📝 ID único para o produto.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário vendedor.
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Título do anúncio do produto.
        title TEXT NOT NULL,
        -- 📝 Descrição detalhada do produto.
        description TEXT,
        -- 📝 Preço do produto.
        price NUMERIC(15, 2) NOT NULL,
        -- 📝 Moeda do preço.
        currency VARCHAR(3) NOT NULL,
        -- 📝 Condição do produto, usando o tipo 'product_condition'.
        condition product_condition,
        -- 📝 Status atual do anúncio, usando o tipo 'product_status'.
        status product_status DEFAULT 'available',
        -- 📝 Localização do produto (para cálculo de frete ou retirada).
        location TEXT,
        -- 📝 Localização geográfica precisa.
        geopoint GEOGRAPHY(Point, 4326),
        -- 📝 Array de URLs das imagens do produto.
        image_urls TEXT[],
        -- 📝 Data e hora de criação do anúncio.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Data e hora da última atualização do anúncio.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Cria um índice no ID do vendedor para buscar todos os produtos de um usuário.
    CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON marketplace_products(seller_id);
    -- 📝 Cria um índice espacial na coluna 'geopoint' para otimizar buscas por proximidade.
    CREATE INDEX IF NOT EXISTS idx_marketplace_products_geopoint ON marketplace_products USING GIST(geopoint);
`;
