
import { UserRepository } from './repositories/UserRepository.js.js';
import { FinancialRepository } from './repositories/FinancialRepository.js.js';
import { FeeRepository } from './repositories/financial/FeeRepository.js.js';
import { GroupRepository } from './repositories/GroupRepository.js.js';
import { PostRepository } from './repositories/PostRepository.js.js';
import { ChatRepository } from './repositories/ChatRepository.js.js';
import { MarketplaceRepository } from './repositories/MarketplaceRepository.js.js';
import { RelationshipRepository } from './repositories/RelationshipRepository.js.js';
import { InteractionRepository } from './repositories/InteractionRepository.js.js';
import { ReportRepository } from './repositories/ReportRepository.js.js';
import { AuditRepository } from './repositories/AuditRepository.js.js';
import { AdRepository } from './repositories/AdRepository.js.js';
import { CredentialsRepository } from './repositories/CredentialsRepository.js.js';
import { PaymentRepository } from './repositories/PaymentRepository.js.js'; // <-- Adicionado
import { query } from './pool.js.js';

/**
 * RepositoryHub
 * Centraliza a exportação de todos os repositórios do sistema.
 */
export const RepositoryHub = {
    users: UserRepository,
    groups: GroupRepository,
    posts: PostRepository,
    chats: ChatRepository,
    marketplace: MarketplaceRepository,
    relationships: RelationshipRepository,
    interactions: InteractionRepository,
    reports: ReportRepository,
    financial: FinancialRepository,
    fees: FeeRepository,
    audit: AuditRepository,
    ads: AdRepository,
    credentials: CredentialsRepository,
    payments: PaymentRepository, // <-- Adicionado
    query: query,

    // Métodos administrativos legados ou utilitários globais
    admin: {
        async getFinancialStats() {
            const res = await query(`
                SELECT 
                    SUM((data->>'platformProfit')::numeric) as total_profit,
                    SUM(amount) as total_seller_payouts,
                    COUNT(*) as total_sales
                FROM financial_transactions 
                WHERE type = 'sale' AND status = 'paid'
            `);
            return res.rows[0] || { total_profit: 0, total_seller_payouts: 0, total_sales: 0 };
        },
        async recordIp(userId, ip, ua) { /* Implementação futura */ }
    }
};
