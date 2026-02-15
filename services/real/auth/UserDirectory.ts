
import { User } from '../../../types';
import { db } from '@/database';
import { API_BASE } from '../../../apiConfig';

const API_USERS = `${API_BASE}/api/users`;

/**
 * @namespace UserDirectory
 * 
 * @description
 * Este objeto é responsável por gerenciar o "diretório" de usuários da aplicação.
 * Ele atua como uma camada de abstração entre a interface do usuário e os dados dos usuários,
 * tanto remotos (vindos da API) quanto locais (cacheados no dispositivo).
 * 
 * Funções principais:
 * 1. Sincronizar a lista de usuários do servidor para o banco de dados local.
 * 2. Fornecer métodos para buscar, pesquisar e acessar usuários.
 * 3. Otimizar a performance, buscando dados primeiro no cache local antes de fazer uma chamada de rede.
 */
export const UserDirectory = {
  
  /**
   * @function syncRemoteUsers
   * @description Sincroniza a lista de todos os usuários remotos para o banco de dados local.
   * É uma operação essencial para popular o cache local com os dados de outros usuários,
   * permitindo que funcionalidades como busca e menções (@) funcionem rapidamente.
   * @param {string | null} currentUserId - O ID do usuário logado, usado para evitar que seus próprios dados sejam sobrescritos.
   */
  async syncRemoteUsers(currentUserId: string | null) {
      try {
          // CORRIGIDO: A rota /sync foi removida. A rota correta é /api/users, que já está na variável API_USERS.
          const response = await fetch(API_USERS);
          if (response.ok) {
              const data = await response.json();
              // O backend retorna um objeto { users: [] }, então acessamos a propriedade correta.
              if (data && Array.isArray(data.users)) {
                  data.users.forEach((user: User) => {
                      // Evita sobrescrever os dados do usuário atual, que podem estar mais atualizados localmente.
                      if (currentUserId && user.id === currentUserId) return;
                      db.users.set(user); // Salva ou atualiza o usuário no banco de dados local (cache).
                  });
              }
          }
      } catch (e) { console.warn("⚠️ [Sync] Falha ao sincronizar usuários."); }
  },

  /**
   * @function searchUsers
   * @description Realiza uma busca por usuários na API do servidor.
   * Esta função é usada pela barra de busca ou qualquer funcionalidade que precise encontrar
   * usuários dinamicamente com base em um termo de pesquisa (nome, @handle, etc.).
   * @param {string} query - O termo de busca.
   * @returns {Promise<User[]>} Uma lista de usuários que correspondem à busca.
   */
  async searchUsers(query: string): Promise<User[]> {
      try {
          const res = await fetch(`${API_USERS}/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
              return await res.json() || [];
          }
      } catch (e) { console.warn("Search fetch failed"); }
      return [];
  },

  /**
   * @function fetchUserByHandle
   * @description Busca um usuário específico pelo seu nome de usuário (@handle) na API.
   * É uma função "inteligente": ela primeiro usa a busca geral da API e depois filtra o resultado
   * para encontrar a correspondência exata. Se encontrar, salva o usuário no cache local para acessos futuros.
   * @param {string} handle - O nome de usuário a ser buscado.
   * @returns {Promise<User | undefined>} O usuário encontrado ou indefinido.
   */
  async fetchUserByHandle(handle: string): Promise<User | undefined> {
      if (!handle) return undefined;
      const clean = handle.replace('@', '').toLowerCase().trim();
      const users = await this.searchUsers(clean);
      const found = users.find((u: any) => u.profile?.name === clean);
      if (found) db.users.set(found); // Salva no cache para não precisar buscar de novo.
      return found;
  },

  /**
   * @function getUserByHandle
   * @description Busca um usuário específico pelo seu @handle, mas SOMENTE no cache local.
   * É a versão rápida da função anterior. Usada para obter dados de um usuário que
   * provavelmente já foi carregado, tornando a resposta instantânea.
   * @param {string} handle - O nome de usuário a ser buscado no cache.
   * @returns {User | undefined} O usuário encontrado no cache ou indefinido.
   */
  getUserByHandle(handle: string): User | undefined {
      const clean = handle.replace('@', '').toLowerCase().trim();
      return Object.values(db.users.getAll()).find(u => u.profile?.name === clean);
  },

  /**
   * @function getAllUsers
   * @description Retorna todos os usuários que estão atualmente no cache local.
   * Útil para funcionalidades que precisam listar usuários já conhecidos pela aplicação
   * sem precisar fazer uma nova requisição ao servidor.
   * @returns {User[]} Uma lista de todos os usuários no banco de dados local.
   */
  getAllUsers(): User[] {
      return Object.values(db.users.getAll());
  }
};
