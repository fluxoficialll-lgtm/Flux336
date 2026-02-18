export const trackingService = {
    track: (params: any) => {
        console.log('[MOCK] Tracking event', params);
    }
};

export const generateTrackingLinkModel = (params: any) => {
    console.log('[MOCK] Generating tracking link model', params);
    return { ...params, tracked: true };
}

export type { TrackingParams } from './types';