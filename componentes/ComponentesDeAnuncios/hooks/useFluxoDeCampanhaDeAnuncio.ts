
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adService } from '@/ServiçosDoFrontend/ServiçoDeAnuncios/adService';
import { groupService } from '@/ServiçosDoFrontend/ServiçoDeGrupos/groupService';
import { AdCampaign, Group } from '@/types';

export const useAdCampaignFlow = () => {
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState<Partial<AdCampaign>>({});
    const [currentStep, setCurrentStep] = useState('campaign');
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewTab, setPreviewTab] = useState('desktop');
    const [destinationMode, setDestinationMode] = useState('url');
    const [interestInput, setInterestInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPlacementLocked, setIsPlacementLocked] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            const groups = await groupService.getMyGroups();
            setMyGroups(groups);
        };
        fetchGroups();
    }, []);

    const handleInputChange = (field: keyof AdCampaign, value: any) => {
        setCampaign(prev => ({ ...prev, [field]: value }));
    };

    const handlePlacementToggle = (placement: string) => {
        // Lógica para lidar com o toggle de posicionamento
    };

    const handleInterestAdd = () => {
        // Lógica para adicionar interesse
    };



    const handleInterestRemove = (interest: string) => {
        // Lógica para remover interesse
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Lógica para lidar com a mudança de arquivo
    };

    const nextStep = () => {
        if (currentStep === 'campaign') setCurrentStep('adset');
        else if (currentStep === 'adset') setCurrentStep('ad');
    };

    const prevStep = () => {
        if (currentStep === 'ad') setCurrentStep('adset');
        else if (currentStep === 'adset') setCurrentStep('campaign');
        else navigate(-1);
    };

    const submitCampaign = async () => {
        setIsLoading(true);
        try {
            await adService.createCampaign(campaign as AdCampaign);
            navigate('/campaign-performance'); // Ajuste a rota conforme necessário
        } catch (error) {
            console.error("Erro ao criar campanha:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        campaign,
        currentStep,
        myGroups,
        selectedContent: null, // Adicione o estado real se necessário
        isLoading,
        previewTab,
        setPreviewTab,
        destinationMode,
        setDestinationMode,
        interestInput,
        setInterestInput,
        fileInputRef,
        isPlacementLocked,
        handleInputChange,
        handlePlacementToggle,
        handleInterestAdd,
        handleInterestRemove,
        handleFileChange,
        nextStep,
        prevStep,
        submitCampaign
    };
};
