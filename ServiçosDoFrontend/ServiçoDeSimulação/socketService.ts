
export const socketService = {
    connect: () => {
        console.log('[MOCK] Socket connected');
    },
    disconnect: () => {
        console.log('[MOCK] Socket disconnected');
    },
    on: (event: string, callback: any) => {
        console.log(`[MOCK] Socket on: ${event}`);
    },
    emit: (event: string, data: any) => {
        console.log(`[MOCK] Socket emit: ${event}`, data);
    }
};
