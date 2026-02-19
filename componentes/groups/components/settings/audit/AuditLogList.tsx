
import React from 'react';
import { AuditLog } from '@/types';
import { AuditLogItem } from '@/componentes/groups/components/settings/audit/AuditLogItem';
import { AuditLogEmptyState } from '@/componentes/groups/components/settings/audit/AuditLogEmptyState';

interface AuditLogListProps {
    logs: AuditLog[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
    return (
        <div className="space-y-4">
            {logs.length > 0 ? (
                logs.map(log => <AuditLogItem key={log.id} log={log} />)
            ) : (
                <AuditLogEmptyState />
            )}
        </div>
    );
};
