
import { createRepositoryProxy } from '../../services/audit/repositoryLoggerProxy.js';
import { logger } from '../../config.js'; // Corrigido

// Importa os repositórios originais
import { AdAnalyticsRepository } from './AdAnalyticsRepository.js';
import { AdRepository } from './AdRepository.js';
import { AggregatorRepository } from './AggregatorRepository.js';
import { AnalyticsRepository } from './AnalyticsRepository.js';
import { AuditRepository } from './AuditRepository.js';
import { ChatRepository } from './ChatRepository.js';
import { CommentRepository } from './CommentRepository.js';
import { CredentialsRepository } from './CredentialsRepository.js';
import { FinancialAnalyticsRepository } from './FinancialAnalyticsRepository.js';
import { FinancialRepository } from './FinancialRepository.js';
import { GroupRepository } from './GroupRepository.js';
import { InteractionRepository } from './InteractionRepository.js';
import { MarketplaceRepository } from './MarketplaceRepository.js';
import { NotificationRepository } from './NotificationRepository.js';
import { PaymentRepository } from './PaymentRepository.js';
import { PostRepository } from './PostRepository.js';
import { ReelsRepository } from './ReelsRepository.js';
import { RelationshipRepository } from './RelationshipRepository.js';
import { ReportRepository } from './ReportRepository.js';
import { UserAnalyticsRepository } from './UserAnalyticsRepository.js';
import { UserRepository } from './UserRepository.js';
import { FeeRepository } from './financial/FeeRepository.js';
import { GroupRankingRepository } from './ranking/GroupRankingRepository.js';

// Cria e exporta os repositórios com proxy, usando o logger centralizado
const AdAnalyticsRepositoryProxy = createRepositoryProxy(AdAnalyticsRepository, logger, 'AdAnalyticsRepository');
const AdRepositoryProxy = createRepositoryProxy(AdRepository, logger, 'AdRepository');
const AggregatorRepositoryProxy = createRepositoryProxy(AggregatorRepository, logger, 'AggregatorRepository');
const AnalyticsRepositoryProxy = createRepositoryProxy(AnalyticsRepository, logger, 'AnalyticsRepository');
const AuditRepositoryProxy = createRepositoryProxy(AuditRepository, logger, 'AuditRepository');
const ChatRepositoryProxy = createRepositoryProxy(ChatRepository, logger, 'ChatRepository');
const CommentRepositoryProxy = createRepositoryProxy(CommentRepository, logger, 'CommentRepository');
const CredentialsRepositoryProxy = createRepositoryProxy(CredentialsRepository, logger, 'CredentialsRepository');
const FinancialAnalyticsRepositoryProxy = createRepositoryProxy(FinancialAnalyticsRepository, logger, 'FinancialAnalyticsRepository');
const FinancialRepositoryProxy = createRepositoryProxy(FinancialRepository, logger, 'FinancialRepository');
const GroupRepositoryProxy = createRepositoryProxy(GroupRepository, logger, 'GroupRepository');
const InteractionRepositoryProxy = createRepositoryProxy(InteractionRepository, logger, 'InteractionRepository');
const MarketplaceRepositoryProxy = createRepositoryProxy(MarketplaceRepository, logger, 'MarketplaceRepository');
const NotificationRepositoryProxy = createRepositoryProxy(NotificationRepository, logger, 'NotificationRepository');
const PaymentRepositoryProxy = createRepositoryProxy(PaymentRepository, logger, 'PaymentRepository');
const PostRepositoryProxy = createRepositoryProxy(PostRepository, logger, 'PostRepository');
const ReelsRepositoryProxy = createRepositoryProxy(ReelsRepository, logger, 'ReelsRepository');
const RelationshipRepositoryProxy = createRepositoryProxy(RelationshipRepository, logger, 'RelationshipRepository');
const ReportRepositoryProxy = createRepositoryProxy(ReportRepository, logger, 'ReportRepository');
const UserAnalyticsRepositoryProxy = createRepositoryProxy(UserAnalyticsRepository, logger, 'UserAnalyticsRepository');
const UserRepositoryProxy = createRepositoryProxy(UserRepository, logger, 'UserRepository');
const FeeRepositoryProxy = createRepositoryProxy(FeeRepository, logger, 'FeeRepository');
const GroupRankingRepositoryProxy = createRepositoryProxy(GroupRankingRepository, logger, 'GroupRankingRepository');

export {
    AdAnalyticsRepositoryProxy as AdAnalyticsRepository,
    AdRepositoryProxy as AdRepository,
    AggregatorRepositoryProxy as AggregatorRepository,
    AnalyticsRepositoryProxy as AnalyticsRepository,
    AuditRepositoryProxy as AuditRepository,
    ChatRepositoryProxy as ChatRepository,
    CommentRepositoryProxy as CommentRepository,
    CredentialsRepositoryProxy as CredentialsRepository,
    FinancialAnalyticsRepositoryProxy as FinancialAnalyticsRepository,
    FinancialRepositoryProxy as FinancialRepository,
    GroupRepositoryProxy as GroupRepository,
    InteractionRepositoryProxy as InteractionRepository,
    MarketplaceRepositoryProxy as MarketplaceRepository,
    NotificationRepositoryProxy as NotificationRepository,
    PaymentRepositoryProxy as PaymentRepository,
    PostRepositoryProxy as PostRepository,
    ReelsRepositoryProxy as ReelsRepository,
    RelationshipRepositoryProxy as RelationshipRepository,
    ReportRepositoryProxy as ReportRepository,
    UserAnalyticsRepositoryProxy as UserAnalyticsRepository,
    UserRepositoryProxy as UserRepository,
    FeeRepositoryProxy as FeeRepository,
    GroupRankingRepositoryProxy as GroupRankingRepository,
};
