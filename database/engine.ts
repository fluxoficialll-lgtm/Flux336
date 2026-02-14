
/**
 * Local JSON Database Engine
 * Acts as a high-performance local cache with broadcast synchronization.
 */

const STORAGE_PREFIX = 'flux_db_';
const BROADCAST_CHANNEL_NAME = 'flux_realtime_sync';

export class JSONEngine {
    private data: Record<string, any[]> = {};
    private isReady: boolean = false;
    private channel: BroadcastChannel;
    private listeners: Map<string, Set<() => void>> = new Map();

    constructor() {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.init();
        this.setupSyncListener();
    }

    private init() {
        try {
            const tables = [
                'users', 'posts', 'groups', 'chats', 
                'notifications', 'relationships', 
                'vip_access', 'marketplace', 'ads'
            ];

            tables.forEach(table => {
                const saved = localStorage.getItem(`${STORAGE_PREFIX}${table}`);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        // FIX: Ensure the parsed data is an array before assigning it.
                        this.data[table] = Array.isArray(parsed) ? parsed : [];
                    } catch {
                        // If parsing fails, default to an empty array.
                        this.data[table] = [];
                    }
                } else {
                    this.data[table] = [];
                }
            });

            this.isReady = true;
            console.log("⚡ Local Storage: JSON Cache Engine initialized");
        } catch (err) {
            console.error("❌ Local Storage: Failed to initialize JSON store", err);
            this.isReady = true; // Still ready, just with empty/partial data
        }
    }

    private setupSyncListener() {
        this.channel.onmessage = (e) => {
            if (e.data.type === 'DB_UPDATE') {
                const table = e.data.table;
                const saved = localStorage.getItem(`${STORAGE_PREFIX}${table}`);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        this.data[table] = Array.isArray(parsed) ? parsed : [];
                        this.notify(table);
                    } catch {
                        // Ignore corrupted broadcast data
                    }
                }
            }
        };
    }

    public getTableData(table: string): any[] {
        return this.data[table] || [];
    }

    public saveTableData(table: string, items: any[]) {
        this.data[table] = items;
        localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(items));
        this.channel.postMessage({ type: 'DB_UPDATE', table });
        this.notify(table);
    }

    public upsertItems(table: string, newItems: any[]) {
        const current = this.getTableData(table);
        const itemMap = new Map(current.map(item => [String(item.id), item]));
        
        newItems.forEach(item => {
            itemMap.set(String(item.id), { ...itemMap.get(String(item.id)), ...item });
        });

        this.saveTableData(table, Array.from(itemMap.values()));
    }

    public subscribe(table: string, cb: () => void) {
        if (!this.listeners.has(table)) this.listeners.set(table, new Set());
        this.listeners.get(table)!.add(cb);
        return () => this.listeners.get(table)?.delete(cb);
    }

    private notify(table: string) {
        if (this.listeners.has(table)) this.listeners.get(table)!.forEach(cb => cb());
        if (this.listeners.has('all')) this.listeners.get('all')!.forEach(cb => cb());
    }

    public isReadyStatus() { return this.isReady; }

    public clearAll() {
        const tables = [
            'users', 'posts', 'groups', 'chats', 
            'notifications', 'relationships', 
            'vip_access', 'marketplace', 'ads'
        ];
        tables.forEach(table => {
            localStorage.removeItem(`${STORAGE_PREFIX}${table}`);
            this.data[table] = [];
        });
        console.log("🧹 [DB Engine] Local cache cleared.");
    }
}

export const sqlite = new JSONEngine();
