
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { logService } from '@/services/logService';
import { eventTracker } from '../services/telemetry/EventTracker'; // Assuming this service exists

/**
 * @interface Props
 * Define as propriedades para o GlobalErrorBoundary. Ele aceita componentes filhos.
 */
interface Props {
    children?: ReactNode;
}

/**
 * @interface State
 * Define o estado interno do ErrorBoundary.
 */
interface State {
    hasError: boolean; // Flag que indica se um erro foi capturado.
    error?: Error;     // O objeto de erro capturado.
}

/**
 * @class GlobalErrorBoundary
 * Um componente React que captura erros de JavaScript em qualquer parte de sua árvore de componentes filhos,
 * registra esses erros e exibe uma interface de usuário de fallback.
 */
export class GlobalErrorBoundary extends Component<Props, State> {

    public state: State = {
        hasError: false,
        error: undefined
    };

    constructor(props: Props) {
        super(props);
    }

    /**
     * Método de ciclo de vida do React.
     * É invocado após um componente descendente lançar um erro. 
     * Ele recebe o erro como um parâmetro e deve retornar um valor para atualizar o estado.
     * @param error O erro que foi lançado.
     * @returns Um objeto de estado que aciona a renderização da UI de fallback.
     */
    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    /**
     * Método de ciclo de vida do React.
     * É invocado após um componente descendente lançar um erro. 
     * É utilizado para realizar efeitos colaterais, como o registro de erros.
     * @param error O erro que foi lançado.
     * @param errorInfo Um objeto com a chave `componentStack`, que contém o stack trace sobre qual componente lançou o erro.
     */
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Registra o erro usando o serviço de log centralizado para depuração.
        logService.logError(
            "Erro de UI capturado pelo GlobalErrorBoundary",
            error,
            errorInfo.componentStack
        );

        // Envia o erro para um serviço de telemetria/analytics (função existente).
        eventTracker.trackCriticalError(error, 'GLOBAL_BOUNDARY_CATCH');
    }

    /**
     * Função para resetar o estado do ErrorBoundary e tentar recarregar a aplicação.
     */
    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        // Força a navegação e o recarregamento para uma rota segura.
        window.location.hash = '/feed';
        window.location.reload();
    };

    /**
     * Renderiza o componente.
     * Se um erro foi capturado, exibe a UI de fallback.
     * Caso contrário, renderiza os componentes filhos normalmente.
     */
    public render(): ReactNode {
        if (this.state.hasError) {
            // Renderização da UI de fallback quando um erro é detectado.
            return (
                <div className="min-h-screen bg-[#0c0f14] flex flex-col items-center justify-center p-6 text-center font-['Inter']">
                    {/* Estilos e estrutura da tela de erro... */}
                    <h1 className="text-2xl font-bold text-white">Ops! Algo falhou.</h1>
                    <p className="text-sm text-gray-400 mt-2 mb-6">Ocorreu um erro inesperado na interface.</p>
                    <button className="bg-blue-500 text-white px-6 py-3 rounded-lg" onClick={this.handleReset}>
                        Recuperar Sistema
                    </button>
                </div>
            );
        }

        // Se não houver erro, renderiza a árvore de componentes normalmente.
        return this.props.children || null;
    }
}

