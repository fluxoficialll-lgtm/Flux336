
import { createRepositoryProxy } from '../../services/audit/repositoryLoggerProxy.js';
import { trafficLogger } from '../../services/audit/trafficLogger.js';

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

// Cria e exporta os repositórios com proxy
const AdAnalyticsRepositoryProxy = createRepositoryProxy(AdAnalyticsRepository, trafficLogger, 'AdAnalyticsRepository');
const AdRepositoryProxy = createRepositoryProxy(AdRepository, trafficLogger, 'AdRepository');
const AggregatorRepositoryProxy = createRepositoryProxy(AggregatorRepository, trafficLogger, 'AggregatorRepository');
const AnalyticsRepositoryProxy = createRepositoryProxy(AnalyticsRepository, trafficLogger, 'AnalyticsRepository');
const AuditRepositoryProxy = createRepositoryProxy(AuditRepository, trafficLogger, 'AuditRepository');
const ChatRepositoryProxy = createRepositoryProxy(ChatRepository, trafficLogger, 'ChatRepository');
const CommentRepositoryProxy = createRepositoryProxy(CommentRepository, trafficLogger, 'CommentRepository');
const CredentialsRepositoryProxy = createRepositoryProxy(CredentialsRepository, trafficLogger, 'CredentialsRepository');
const FinancialAnalyticsRepositoryProxy = createRepositoryProxy(FinancialAnalyticsRepository, trafficLogger, 'FinancialAnalyticsRepository');
const FinancialRepositoryProxy = createRepositoryProxy(FinancialRepository, trafficLogger, 'FinancialRepository');
const GroupRepositoryProxy = createRepositoryProxy(GroupRepository, trafficLogger, 'GroupRepository');
const InteractionRepositoryProxy = createRepositoryProxy(InteractionRepository, trafficLogger, 'InteractionRepository');
const MarketplaceRepositoryProxy = createRepositoryProxy(MarketplaceRepository, trafficLogger, 'MarketplaceRepository');
const NotificationRepositoryProxy = createRepositoryProxy(NotificationRepository, trafficLogger, 'NotificationRepository');
const PaymentRepositoryProxy = createRepositoryProxy(PaymentRepository, trafficLogger, 'PaymentRepository');
const PostRepositoryProxy = createRepositoryProxy(PostRepository, trafficLogger, 'PostRepository');
const ReelsRepositoryProxy = createRepositoryProxy(ReelsRepository, trafficLogger, 'ReelsRepository');
const RelationshipRepositoryProxy = createRepositoryProxy(RelationshipRepository, trafficLogger, 'RelationshipRepository');
const ReportRepositoryProxy = createRepositoryProxy(ReportRepository, trafficLogger, 'ReportRepository');
const UserAnalyticsRepositoryProxy = createRepositoryProxy(UserAnalyticsRepository, trafficLogger, 'UserAnalyticsRepository');
const UserRepositoryProxy = createRepositoryProxy(UserRepository, trafficLogger, 'UserRepository');
const FeeRepositoryProxy = createRepositoryProxy(FeeRepository, trafficLogger, 'FeeRepository');
const GroupRankingRepositoryProxy = createRepositoryProxy(GroupRankingRepository, trafficLogger, 'GroupRankingRepository');

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
