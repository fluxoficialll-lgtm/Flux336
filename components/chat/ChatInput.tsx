import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types'; // Assuming this path is correct

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onFileSelect: (file: File, isDoc: boolean) => void;
    onSendAudio: (duration: string) => void;
    isBlocked?: boolean;
    isUploading?: boolean;
    placeholder?: string;
    replyingTo?: ChatMessage | null;
    onCancelReply?: () => void;
    editingMessage?: ChatMessage | null;
    onCancelEdit?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage, onFileSelect, onSendAudio,
    isBlocked = false, isUploading = false,
    placeholder = "Mensagem...",
    replyingTo, onCancelReply,
    editingMessage, onCancelEdit
}) => {
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingInterval = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingMessage) {
            setInputText(editingMessage.text || '');
            inputRef.current?.focus();
        } else {
          // setInputText(''); // Optional: clear input when editing is cancelled
        }
    }, [editingMessage]);

    useEffect(() => {
        if (isRecording) {
            recordingInterval.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } else {
            clearInterval(recordingInterval.current);
            setRecordingTime(0);
        }
        return () => clearInterval(recordingInterval.current);
    }, [isRecording]);

    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    const handleSend = () => {
        if (inputText.trim() || editingMessage) { // Allow sending empty string to clear message while editing
            onSendMessage(inputText);
            setInputText('');
        }
    };

    const handleAudioAction = () => {
        if (inputText.trim() || editingMessage) {
            handleSend();
        } else if (isRecording) {
            setIsRecording(false);
            onSendAudio(formatTime(recordingTime));
        } else {
            setIsRecording(true);
        }
    };

    const actionContext = editingMessage || replyingTo;
    const isEditing = !!editingMessage;

    if (isBlocked) {
        return (
            <div className="fixed bottom-0 w-full bg-gray-900 p-4 text-center text-red-500 italic font-bold border-t border-gray-700 z-10">
                Você bloqueou este contato.
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 w-full bg-gray-900 border-t border-gray-700 z-10 pb-4">
            {actionContext && (
                <div className="bg-gray-800 p-2 mx-3 mt-2 rounded-lg flex items-center justify-between">
                    <div className="flex items-center overflow-hidden">
                        <i className={`fa-solid ${isEditing ? 'fa-pencil' : 'fa-reply'} text-blue-400 text-lg mx-2`}></i>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-blue-400 text-sm">{isEditing ? 'Editando Mensagem' : `Respondendo a ${actionContext.senderName}`}</span>
                            <p className="text-white text-xs truncate whitespace-pre-wrap">{actionContext.text}</p>
                        </div>
                    </div>
                    <button onClick={isEditing ? onCancelEdit : onCancelReply} className="bg-transparent border-none text-gray-400 text-xl p-2">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2 p-3">
                {isRecording ? (
                    <>
                        <div className="flex-grow flex items-center p-2 text-red-500">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                            <span>Gravando {formatTime(recordingTime)}</span>
                        </div>
                        <button onClick={() => setIsRecording(false)} className="text-red-500 font-bold bg-none border-none cursor-pointer mr-2">
                            Cancelar
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex-1 flex items-center bg-gray-800 rounded-full px-2">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={placeholder}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-grow p-3 border-none bg-transparent text-white text-base outline-none rounded-full"
                            />
                            <button onClick={() => docInputRef.current?.click()} className="bg-none border-none text-gray-400 text-lg cursor-pointer p-2 hover:text-white">
                                <i className="fa-solid fa-paperclip"></i>
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="bg-none border-none text-gray-400 text-lg cursor-pointer p-2 pr-3 hover:text-white">
                                <i className="fa-solid fa-camera"></i>
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} accept="image/*,video/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0], false)} />
                        <input type="file" ref={docInputRef} accept=".*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0], true)} />
                    </>
                )}
                <button
                    onClick={handleAudioAction}
                    disabled={isUploading}
                    className="bg-blue-500 border-none text-black text-lg cursor-pointer w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md disabled:opacity-50">
                    {isUploading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className={`fa-solid ${inputText.trim() || isRecording || editingMessage ? 'fa-paper-plane' : 'fa-microphone'}`}></i>}
                </button>
            </div>
        </div>
    );
};
