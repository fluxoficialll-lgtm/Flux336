
/**
 * @file Define o schema da tabela para armazenar as credenciais dos provedores de pagamento.
 */

/**
 * String SQL para criar a tabela `payment_provider_credentials`.
 * Esta tabela armazena as chaves de API e outros segredos para serviços como Stripe, PayPal, etc.
 *
 * Colunas:
 * - id: Identificador único para o registro.
 * - user_id: Chave estrangeira que referencia o usuário proprietário das credenciais.
 * - provider: Nome do provedor de pagamento (ex: 'stripe', 'paypal').
 * - credentials: Um campo JSONB para armazenar as credenciais de forma segura (devem ser criptografadas pela aplicação).
 * - created_at / updated_at: Timestamps para controle de versão.
 *
 * Restrições:
 * - UNIQUE (user_id, provider): Garante que um usuário só pode ter um conjunto de credenciais por provedor.
 * - ON DELETE CASCADE: Se um usuário for deletado, suas credenciais também serão.
 */
export const up = `
CREATE TABLE IF NOT EXISTS payment_provider_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    credentials JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, provider)
);
`;
