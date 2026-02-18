
interface LogDetails {
    message: string;
    componentStack?: string;
    error?: any;
    timestamp: string;
}

/**
 * @class LogService
 * Fornece uma interface centralizada para o registro de eventos e erros da aplicação.
 * Os logs são exibidos no console para depuração local e enviados ao backend 
 * para monitoramento centralizado.
 */
class LogService {

    /**
     * Envia um objeto de log para o endpoint de ingestão no backend.
     * Utiliza navigator.sendBeacon para um envio assíncrono e não bloqueante,
     * garantindo que o log seja enviado sem impactar a performance da UI.
     * 
     * @param payload O objeto de log a ser enviado.
     */
    private sendToIngestEndpoint(payload: object): void {
        try {
            const url = '/api/logs/ingest';
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

            // sendBeacon é a forma mais confiável de enviar telemetria, mesmo se a página estiver sendo descarregada.
            if (navigator.sendBeacon) {
                navigator.sendBeacon(url, blob);
            } else {
                // Fallback para navegadores mais antigos que não suportam sendBeacon.
                fetch(url, { method: 'POST', body: blob, keepalive: true });
            }
        } catch (e) {
            // Se até o envio do log falhar, logamos no console para não iniciar um loop infinito.
            console.error("[LogService] Falha crítica ao enviar log para o backend:", e);
        }
    }

    /**
     * Registra um evento geral da aplicação (ex: navegação, ação do usuário).
     * 
     * @param message Uma mensagem clara descrevendo o evento.
     * @param details Um objeto com dados adicionais relevantes para o evento.
     */
    public logEvent(message: string, details: object = {}): void {
        const eventPayload = {
            level: 'info',
            message,
            details,
            timestamp: new Date().toISOString(),
        };
        console.log(`[LogService] Evento: ${message}`, details);
        this.sendToIngestEndpoint(eventPayload);
    }

    /**
     * Registra um erro capturado, como de um ErrorBoundary ou um bloco catch.
     * 
     * @param message Mensagem contextual sobre o que estava acontecendo quando o erro ocorreu.
     * @param error O objeto de erro capturado.
     * @param componentStack O stack de componentes do React.
     */
    public logError(message: string, error?: any, componentStack?: string): void {
        const logDetails: LogDetails = {
            message,
            componentStack: componentStack || "Não disponível",
            error: error ? this.formatError(error) : "Não disponível",
            timestamp: new Date().toISOString(),
        };

        console.error("[LogService] Erro Capturado:", JSON.stringify(logDetails, null, 2));
        
        // Envia o erro formatado para o backend com o nível 'error'.
        this.sendToIngestEndpoint({ level: 'error', ...logDetails });
    }

    /**
     * Extrai e formata as propriedades essenciais de um objeto de erro do JavaScript.
     */
    private formatError(error: any): object {
        return {
            name: error.name || "Nome do erro não disponível",
            message: error.message || "Mensagem de erro não disponível",
            stack: error.stack || "Stack trace não disponível",
        };
    }
}

export const logService = new LogService();
