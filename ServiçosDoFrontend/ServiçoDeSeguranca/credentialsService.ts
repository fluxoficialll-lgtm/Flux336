
import { apiClient } from '@/ServiçosDoFrontend/ServiçoDeAPI/apiClient';

const BASE_URL = '/credentials';

/**
 * @namespace credentialsService
 * @description
 * Service para gerenciar as credenciais dos provedores de pagamento no frontend.
 * Comunica-se com a API de credenciais no backend.
 */
export const credentialsService = {

    /**
     * Busca o status de conexão de todos os provedores para o usuário logado.
     * Retorna uma lista com os nomes dos provedores que possuem credenciais salvas.
     * @returns {Promise<string[]>} Ex: ['stripe', 'paypal']
     */
    async getConnectedProviders(): Promise<string[]> {
        try {
            const response = await apiClient.get<{ connectedProviders: string[] }>(`${BASE_URL}/status`);
            return response.data.connectedProviders || [];
        } catch (error) {
            console.error("Erro ao buscar status dos provedores:", error);
            return []; // Retorna um array vazio em caso de erro para não quebrar a UI
        }
    },

    /**
     * Salva as credenciais para um provedor específico.
     * @param {string} provider - O nome do provedor (ex: 'stripe').
     * @param {object} credentials - O objeto contendo as credenciais.
     * @returns {Promise<any>} A resposta da API.
     */
    async saveCredentials(provider: string, credentials: any): Promise<any> {
        return apiClient.post(`${BASE_URL}/save`, { provider, credentials });
    },

    /**
     * Desconecta um provedor, removendo suas credenciais.
     * @param {string} provider - O nome do provedor a ser desconectado.
     * @returns {Promise<any>} A resposta da API.
     */
    async disconnectProvider(provider: string): Promise<any> {
        return apiClient.post(`${BASE_URL}/disconnect`, { provider });
    },
};
