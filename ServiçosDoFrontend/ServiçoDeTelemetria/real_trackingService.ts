export const trackingService = {
    track: (params: any) => {
        console.log('[REAL] Tracking event', params);
    }
};

export const generateTrackingLinkModel = (params: any) => {
    console.log('[REAL] Generating tracking link model', params);
    return { ...params, tracked: true };
}

export type { TrackingParams } from './types';