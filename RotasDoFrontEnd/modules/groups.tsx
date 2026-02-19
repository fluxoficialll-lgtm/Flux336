
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../componentes/ComponentesDeLogin/ProtectedRoute';

const Groups = lazy(() => import('../../Paginas/Grupos').then(m => ({ default: m.Groups })));
const GroupChat = lazy(() => import('../../Paginas/BatePapoEmGrupo').then(m => ({ default: m.GroupChat })));
const GroupLanding = lazy(() => import('../../Paginas/PaginaDeDestinoDoGrupo').then(m => ({ default: m.GroupLanding })));
const CreateGroup = lazy(() => import('../../Paginas/CriarGrupo').then(m => ({ default: m.CreateGroup })));
const CreateVipGroup = lazy(() => import('../../Paginas/CriarGrupoVip').then(m => ({ default: m.CreateVipGroup })));
const CreatePublicGroup = lazy(() => import('../../Paginas/CriarGrupoPublico').then(m => ({ default: m.CreatePublicGroup })));
const CreatePrivateGroup = lazy(() => import('../../Paginas/CriarGrupoPrivado').then(m => ({ default: m.CreatePrivateGroup })));
const EditGroup = lazy(() => import('../../Paginas/EditarGrupo').then(m => ({ default: m.EditGroup })));
const VipGroupSales = lazy(() => import('../../Paginas/VendasDeGruposVip').then(m => ({ default: m.VipGroupSales })));
const GroupSettings = lazy(() => import('../../Paginas/ConfiguracoesDoGrupo').then(m => ({ default: m.GroupSettings })));
const SuccessBridge = lazy(() => import('../../Paginas/PonteDeSucesso').then(m => ({ default: m.SuccessBridge })));
const GroupInfoPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeInformacoesDoGrupo').then(m => ({ default: m.GroupInfoPage })));
const GroupAccessPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeAcessoDoGrupo').then(m => ({ default: m.GroupAccessPage })));
const GroupModerationPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeModeracaoDoGrupo').then(m => ({ default: m.GroupModerationPage })));
const GroupMembersPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeMembrosDoGrupo').then(m => ({ default: m.GroupMembersPage })));
const GroupVipPage = lazy(() => import('../../Paginas/groups/settings/PaginaVipDoGrupo').then(m => ({ default: m.GroupVipPage })));
const GroupStatisticsPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeEstatisticasDoGrupo').then(m => ({ default: m.GroupStatisticsPage })));
const GroupAuditLogs = lazy(() => import('../../Paginas/groups/settings/LogsDeAuditoriaDoGrupo').then(m => ({ default: m.GroupAuditLogs })));
const GroupChannelsPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeCanaisDoGrupo').then(m => ({ default: m.GroupChannelsPage })));
const GroupSchedule = lazy(() => import('../../Paginas/groups/settings/CronogramaDoGrupo').then(m => ({ default: m.GroupSchedule })));
const GroupSalesPlatformPage = lazy(() => import('../../Paginas/groups/settings/PaginaDaPlataformaDeVendasDoGrupo').then(m => ({ default: m.GroupSalesPlatformPage })));
const GroupSalesPlatformView = lazy(() => import('../../Paginas/groups/VisaoDaPlataformaDeVendasDoGrupo').then(m => ({ default: m.GroupSalesPlatformView })));
const SalesFolderContentPage = lazy(() => import('../../Paginas/groups/PaginaDeConteudoDaPastaDeVendas').then(m => ({ default: m.SalesFolderContentPage })));
const GroupRolesPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeFuncoesDoGrupo').then(m => ({ default: m.GroupRolesPage })));
const GroupChannelsList = lazy(() => import('../../Paginas/groups/ListaDeCanaisDoGrupo').then(m => ({ default: m.GroupChannelsList })));
const GroupCheckoutConfigPage = lazy(() => import('../../Paginas/groups/settings/PaginaDeConfiguracaoDeCheckoutDoGrupo').then(m => ({ default: m.GroupCheckoutConfigPage })));
const GroupLimits = lazy(() => import('../../Paginas/LimiteEControle').then(m => ({ default: m.LimitAndControl })));
const ManageGroupLinks = lazy(() => import('../../Paginas/GerenciarLinksDoGrupo').then(m => ({ default: m.ManageGroupLinks })));
const GroupRevenue = lazy(() => import('../../Paginas/ReceitaDoGrupo').then(m => ({ default: m.GroupRevenue })));
const VipSalesHistory = lazy(() => import('../../Paginas/HistoricoDeVendasVip').then(m => ({ default: m.VipSalesHistory })));

export const groupRoutes = [
    { path: '/groups', element: <ProtectedRoute><Groups /></ProtectedRoute> },
    { path: '/group-chat/:id', element: <ProtectedRoute><GroupChat /></ProtectedRoute> },
    { path: '/group-chat/:id/:channelId', element: <ProtectedRoute><GroupChat /></ProtectedRoute> },
    { path: '/group/:id/channels', element: <ProtectedRoute><GroupChannelsList /></ProtectedRoute> },
    { path: '/group-landing/:id', element: <GroupLanding /> },
    { path: '/vip-group-sales/:id', element: <VipGroupSales /> },
    { path: '/create-group', element: <ProtectedRoute><CreateGroup /></ProtectedRoute> },
    { path: '/create-group/vip', element: <ProtectedRoute><CreateVipGroup /></ProtectedRoute> },
    { path: '/create-group/public', element: <ProtectedRoute><CreatePublicGroup /></ProtectedRoute> },
    { path: '/create-group/private', element: <ProtectedRoute><CreatePrivateGroup /></ProtectedRoute> },
    { path: '/edit-group/:id', element: <ProtectedRoute><EditGroup /></ProtectedRoute> },
    { path: '/payment-success-bridge/:id', element: <ProtectedRoute><SuccessBridge /></ProtectedRoute> },
    { path: '/group-settings/:id', element: <ProtectedRoute><GroupSettings /></ProtectedRoute> },
    { path: '/group-settings/:id/info', element: <ProtectedRoute><GroupInfoPage /></ProtectedRoute> },
    { path: '/group-settings/:id/access', element: <ProtectedRoute><GroupAccessPage /></ProtectedRoute> },
    { path: '/group-settings/:id/moderation', element: <ProtectedRoute><GroupModerationPage /></ProtectedRoute> },
    { path: '/group-settings/:id/members', element: <ProtectedRoute><GroupMembersPage /></ProtectedRoute> },
    { path: '/group-settings/:id/roles', element: <ProtectedRoute><GroupRolesPage /></ProtectedRoute> },
    { path: '/group-settings/:id/vip', element: <ProtectedRoute><GroupVipPage /></ProtectedRoute> },
    { path: '/group-settings/:id/stats', element: <ProtectedRoute><GroupStatisticsPage /></ProtectedRoute> },
    { path: '/group-settings/:id/audit', element: <ProtectedRoute><GroupAuditLogs /></ProtectedRoute> },
    { path: '/group-settings/:id/channels', element: <ProtectedRoute><GroupChannelsPage /></ProtectedRoute> },
    { path: '/group-settings/:id/schedule', element: <ProtectedRoute><GroupSchedule /></ProtectedRoute> },
    { path: '/group-settings/:id/sales-platform', element: <ProtectedRoute><GroupSalesPlatformPage /></ProtectedRoute> },
    { path: '/group-settings/:id/checkout-config', element: <ProtectedRoute><GroupCheckoutConfigPage /></ProtectedRoute> },
    { path: '/group-platform/:id', element: <ProtectedRoute><GroupSalesPlatformView /></ProtectedRoute> },
    { path: '/group-folder/:groupId/:folderId', element: <ProtectedRoute><SalesFolderContentPage /></ProtectedRoute> },
    { path: '/group-limits/:id', element: <ProtectedRoute><GroupLimits /></ProtectedRoute> },
    { path: '/group-links/:id', element: <ProtectedRoute><ManageGroupLinks /></ProtectedRoute> },
    { path: '/group-revenue/:id', element: <ProtectedRoute><GroupRevenue /></ProtectedRoute> },
    { path: '/vip-sales-history/:id', element: <ProtectedRoute><VipSalesHistory /></ProtectedRoute> }
  ];
