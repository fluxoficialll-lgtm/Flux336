
import React from 'react';

// Mock de dados de transação
const mockTransactions = [
  { id: '1', date: '2024-07-28', description: 'Assinatura VIP - Grupo Tech', amount: -29.99, type: 'debit' },
  { id: '2', date: '2024-07-27', description: 'Venda de E-book de Programação', amount: 49.90, type: 'credit' },
  { id: '3', date: '2024-07-25', description: 'Créditos para Anúncios', amount: -50.00, type: 'debit' },
  { id: '4', date: '2024-07-24', description: 'Pagamento recebido de @joana', amount: 15.00, type: 'credit' },
  { id: '5', date: '2024-07-22', description: 'Saque para conta bancária', amount: -250.00, type: 'debit' },
];

export const TransactionHistoryPage: React.FC = () => {

  const handleBack = () => {
    window.history.back();
  };

  const renderTransactionItem = (transaction: typeof mockTransactions[0]) => {
    const isCredit = transaction.type === 'credit';
    const amountColor = isCredit ? 'text-green-400' : 'text-red-400';
    const sign = isCredit ? '+' : '-';

    return (
      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-3">
        <div>
          <p className="font-semibold text-white">{transaction.description}</p>
          <p className="text-sm text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>
        <p className={`font-bold text-lg ${amountColor}`}>
          {sign} R$ {Math.abs(transaction.amount).toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold">Histórico de Transações</h1>
      </header>

      <main>
        {mockTransactions.length > 0 ? (
          mockTransactions.map(renderTransactionItem)
        ) : (
          <p className="text-center text-gray-500 mt-10">Nenhuma transação encontrada.</p>
        )}
      </main>
    </div>
  );
};
