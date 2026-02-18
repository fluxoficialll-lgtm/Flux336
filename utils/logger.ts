
/**
 * Níveis de log disponíveis, espelhando os níveis do backend.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Detalhes adicionais que podem ser enviados com o log.
 */
interface LogDetails {
  [key: string]: any;
}

/**
 * Envia um evento de log do cliente para o endpoint da API no backend.
 *
 * Esta função é o ponto central para registrar eventos do frontend. Ela envia os logs
 * para a rota `/api/client-logs` que criamos, permitindo que os eventos da UI
 * sejam registrados e analisados junto com os logs do servidor.
 * A chamada é feita de forma assíncrona e encapsulada em um try-catch
 * para garantir que uma falha no envio do log nunca quebre a aplicação para o usuário.
 *
 * @param {LogLevel} level - O nível de severidade do log (e.g., 'info', 'error').
 * @param {string} message - A mensagem descritiva do evento.
 * @param {LogDetails} [details] - Um objeto opcional com dados contextuais (e.g., { component: 'LoginButton', userId: '123' }).
 */
export const logClientEvent = async (
  level: LogLevel,
  message: string,
  details?: LogDetails
): Promise<void> => {
  try {
    // Usa a API fetch do navegador para enviar o log para o nosso backend.
    await fetch('/api/client-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        message,
        details,
      }),
    });
  } catch (error) {
    // Em um ambiente de produção, falhamos silenciosamente para não impactar o usuário.
    // Em desenvolvimento, exibimos um erro no console para ajudar na depuração.
    if (process.env.NODE_ENV === 'development') {
      console.error('Falha ao enviar log do cliente para a API:', error);
    }
  }
};
