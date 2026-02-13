
/**
 * @interface LogDetails
 * Define a estrutura padronizada para um registro de log de erro.
 * Isso garante que todos os erros capturados contenham um conjunto consistente de informações
 * para depuração.
 */
interface LogDetails {
    message: string;          // Mensagem de alto nível que descreve o contexto do erro.
    componentStack?: string; // O stack trace do React, mostrando a hierarquia de componentes que levou ao erro.
    error?: any;              // O objeto de erro original (ex: new Error()), contendo o stack trace do JavaScript.
    timestamp: string;        // Timestamp no formato ISO de quando o erro foi registrado.
}

/**
 * @class LogService
 * Fornece uma interface centralizada para registro de erros da aplicação.
 * O objetivo é padronizar como os erros são capturados e reportados.
 */
class LogService {

    /**
     * Registra os detalhes de um erro capturado.
     * Este método formata o erro em uma estrutura `LogDetails` e o envia para o console.
     * Futuramente, este método pode ser estendido para enviar os logs a um serviço externo (ex: Sentry, LogRocket).
     *
     * @param message Mensagem contextual sobre o que estava acontecendo quando o erro ocorreu.
     * @param error O objeto de erro capturado.
     * @param componentStack O stack de componentes do React, fornecido por um ErrorBoundary.
     */
    public logError(message: string, error?: any, componentStack?: string): void {
        
        const logDetails: LogDetails = {
            message,
            componentStack: componentStack || "Não disponível",
            error: error ? this.formatError(error) : "Não disponível",
            timestamp: new Date().toISOString(),
        };

        // Saída do log para o console de erros. 
        // O uso de `JSON.stringify` com formatação torna o objeto de log fácil de ler.
        console.error("[LogService] Erro Capturado:", JSON.stringify(logDetails, null, 2));
    }

    /**
     * Extrai e formata as propriedades essenciais de um objeto de erro do JavaScript.
     * Objetos de erro nativos não são serializados de forma limpa pelo `JSON.stringify`,
     * então este método garante que as informações mais importantes sejam preservadas.
     *
     * @param error O objeto de erro original.
     * @returns Um objeto contendo as propriedades `name`, `message` e `stack` do erro.
     */
    private formatError(error: any): object {
        return {
            name: error.name || "Nome do erro não disponível",
            message: error.message || "Mensagem de erro não disponível",
            stack: error.stack || "Stack trace não disponível",
        };
    }
}

/**
 * Instância singleton do LogService.
 * Exportar uma instância única garante que o mesmo serviço de logging seja
 * utilizado em toda a aplicação, mantendo a consistência.
 */
export const logService = new LogService();
