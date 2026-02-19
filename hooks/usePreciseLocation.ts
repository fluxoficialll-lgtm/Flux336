
import { useState, useCallback } from 'react';
import { LocationFilter, Coordinates, AddressProfile } from '../types/location.types';
import { LocationIntelligence } from '../ServiçosDoFrontend/geo/LocationIntelligence';
import { apiClient } from '../ServiçosDoFrontend/apiClient'; // CORREÇÃO: Importação nomeada

const STORAGE_KEY = 'flux_user_geo_filter';

export const usePreciseLocation = () => {
    const [loading, setLoading] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<LocationFilter>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : { type: 'global' };
    });

    const updateFilter = useCallback((filter: LocationFilter) => {
        setCurrentFilter(filter);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filter));
    }, []);

    const captureGps = async () => {
        setLoading(true);
        try {
            const coords = await LocationIntelligence.getCurrentPosition();

            // Usando a importação nomeada 'apiClient'
            apiClient.post('/users/update-location', { 
                latitude: coords.latitude, 
                longitude: coords.longitude 
            }).catch(err => console.error("Falha ao salvar localização no backend:", err));
            
            const address = await LocationIntelligence.reverseGeocode(coords);
            
            const newFilter: LocationFilter = {
                type: 'radius',
                radius: 50, // default
                coords,
                targetAddress: address
            };
            
            updateFilter(newFilter);
            return newFilter;
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const findNearbyUsers = async (coords: Coordinates, radius: number) => {
        try {
            // Usando a importação nomeada 'apiClient'
            const response = await apiClient.get('/users/nearby', {
                params: {
                    lat: coords.latitude,
                    lon: coords.longitude,
                    radius: radius * 1000 // Convertendo km para metros
                }
            });
            return response.data; 
        } catch (error) {
            console.error("Falha ao buscar usuários próximos:", error);
            return [];
        }    
    };

    const clearFilter = () => {
        const filter: LocationFilter = { type: 'global' };
        updateFilter(filter);
    };

    return {
        currentFilter,
        loading,
        captureGps,
        updateFilter,
        clearFilter,
        findNearbyUsers
    };
};
