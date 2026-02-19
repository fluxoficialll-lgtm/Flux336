import React, { useState } from 'react';
import { ChatMessage } from '../types'';
import { useModal } from '@/componentes/ModalSystem';

interface ReportMessageModalProps {
  messageToReport: ChatMessage | null;
  onConfirm: (reason: string, comments: string) => void;
}

const REPORT_REASONS = [
    'Spam ou Phishing',
    'Conteúdo de ódio ou abusivo',
    'Violência ou conteúdo gráfico',
    'Assédio ou bullying',
    'Informação falsa',
    'Outro',
];

export const ReportMessageModal: React.FC<ReportMessageModalProps> = ({ messageToReport, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [comments, setComments] = useState('');
  const { hideModal } = useModal();

  const handleConfirm = () => {
      if (selectedReason) {
          onConfirm(selectedReason, comments);
      }
  }

  if (!messageToReport) return null;

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-lg p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white">Denunciar Mensagem</h2>
        <p className="text-gray-300">Por favor, selecione o motivo da denúncia para a mensagem:</p>
        <blockquote className="border-l-4 border-gray-600 pl-4 py-2 bg-gray-700/50">
            <p className="text-gray-400 italic truncate">{messageToReport.text}</p>
        </blockquote>
        
        <div className="flex flex-col gap-2">
            {REPORT_REASONS.map(reason => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="radio" 
                        name="report-reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="h-4 w-4 accent-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                    />
                    <span className="text-white">{reason}</span>
                </label>
            ))}
        </div>

        {selectedReason === 'Outro' && (
            <textarea 
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Por favor, forneça mais detalhes..."
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                rows={3}
            />
        )}
        
        <div className="flex justify-end gap-3 pt-4">
            <button onClick={hideModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors font-semibold">
                Cancelar
            </button>
            <button 
                onClick={handleConfirm}
                disabled={!selectedReason}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors font-semibold"
            >
                Denunciar
            </button>
        </div>
    </div>
  );
};
