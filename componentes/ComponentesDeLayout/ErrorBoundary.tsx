
// -------------------------------------------------------------------------------------
// PASSO 1: IMPORTANDO AS FERRAMENTAS NECESSÁRIAS
// -------------------------------------------------------------------------------------
// React é a nossa ferramenta principal. O `Component` é o tipo de classe que nos permite
// criar um ErrorBoundary. `ReactNode` é o tipo para qualquer coisa que o React possa renderizar.
import React, { Component, ReactNode } from 'react';

// Importamos o nosso serviço de logging recém-criado. Ele será usado para enviar os detalhes do erro.
import { logService } from '@/ServiçosDoFrontend/logService';

// -------------------------------------------------------------------------------------
// PASSO 2: DEFININDO OS "INGREDIENTES" (PROPS) E O "ESTADO" DO COMPONENTE
// -------------------------------------------------------------------------------------

// Definimos as "props" que nosso ErrorBoundary pode receber.
// `children` é uma prop especial no React: representa os componentes que estarão "dentro" do ErrorBoundary.
interface Props {
    children: ReactNode; // Ex: As rotas da nossa aplicação.
}

// Definimos o "estado" interno do nosso componente.
// `hasError` é uma bandeira booleana. Começa como `false` e se torna `true` se um erro for capturado.
interface State {
    hasError: boolean;
}

// -------------------------------------------------------------------------------------
// PASSO 3: CONSTRUINDO O COMPONENTE ERRORBOUNDARY
// -------------------------------------------------------------------------------------
// Criamos a classe ErrorBoundary, que estende a funcionalidade de um `Component` do React.
export class ErrorBoundary extends Component<Props, State> {

    // O "construtor" é a primeira coisa que roda quando o componente é criado.
    // Aqui, nós apenas inicializamos o estado inicial.
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    // Este é um método de ciclo de vida MÁGICO do React. 
    // Ele é chamado automaticamente sempre que um componente filho (dentro do ErrorBoundary) lança um erro.
    // Ele recebe o erro e nos permite atualizar o estado para que possamos renderizar uma UI de fallback.
    static getDerivedStateFromError(_: Error): State {
        // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
        return { hasError: true };
    }

    // Este é outro método de ciclo de vida MÁGICO. 
    // Ele é chamado DEPOIS que um erro em um componente filho foi capturado.
    // É o lugar PERFEITO para executar "efeitos colaterais", como o logging do erro.
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Usamos nosso logService para registrar os detalhes do erro.
        logService.logError(
            "Erro de renderização capturado pelo ErrorBoundary",
            error, // O objeto de erro original.
            errorInfo.componentStack // A pilha de componentes que nos diz ONDE o erro aconteceu.
        );
    }

    // O método `render` é responsável por decidir o que será exibido na tela.
    render() {
        // PASSO 3.1: VERIFICANDO SE UM ERRO ACONTECEU
        if (this.state.hasError) {
            // Se `hasError` for true, nós renderizamos nossa UI de fallback personalizada.
            return (
                <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-4">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Opa, algo deu errado.</h1>
                    <p className="text-lg mb-2 text-center">Um erro inesperado aconteceu e nossa equipe já foi notificada.</p>
                    <p className="text-md text-gray-400 mb-6">Por favor, tente recarregar a página.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors"
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        // PASSO 3.2: SE NENHUM ERRO ACONTECEU
        // Se `hasError` for false, nós simplesmente renderizamos os componentes filhos normalmente.
        // Ou seja, a aplicação funciona como o esperado.
        return this.props.children;
    }
}
