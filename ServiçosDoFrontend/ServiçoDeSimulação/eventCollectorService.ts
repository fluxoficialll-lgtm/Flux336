
export const eventCollectorService = {
    track: (eventName: string, data: any) => {
        console.log(`[MOCK] Event Tracked: ${eventName}`, data);
    }
};
