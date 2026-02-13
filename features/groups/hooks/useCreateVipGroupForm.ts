
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../../services/groupService';
import { authService } from '../../../services/authService';
import { postService } from '../../../services/postService';
import { Group, VipMediaItem } from '../../../types';
import { CurrencyType } from '../../../components/groups/CurrencySelectorModal';
import { GATEWAY_CURRENCIES, DEFAULT_CURRENCY_FOR_GATEWAY } from '../../../services/gatewayConfig';

export const useCreateVipGroupForm = () => {
  const navigate = useNavigate();
  
  // Form States
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  
  // VIP Door States
  const [vipMediaItems, setVipMediaItems] = useState<{file?: File, url: string, type: 'image' | 'video'}[]>([]);
  const [vipDoorText, setVipDoorText] = useState('');
  const [vipButtonText, setVipButtonText] = useState(''); 

  // Price & Access States
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyType>('BRL');
  const [accessType, setAccessType] = useState<'lifetime' | 'temporary' | 'one_time'>('lifetime');
  const [accessConfig, setAccessConfig] = useState<any>(null);
  
  // Provider State
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Advanced Marketing
  const [pixelId, setPixelId] = useState('');
  const [pixelToken, setPixelToken] = useState('');
  const [isPixelModalOpen, setIsPixelModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  
  // Crop states
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string>('');

  const [isCreating, setIsCreating] = useState(false);
  const [hasProvider, setHasProvider] = useState(false);

  // Upload Progress States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCurrent, setUploadCurrent] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  useEffect(() => {
      const user = authService.getCurrentUser();
      const connected = !!user?.paymentConfig?.isConnected || !!Object.values(user?.paymentConfigs || {}).some(c => c.isConnected);
      setHasProvider(connected);
      
      if (user?.paymentConfig?.isConnected) {
          setSelectedProviderId(user.paymentConfig.providerId);
      } else if (user?.paymentConfigs) {
          const firstConnected = Object.values(user.paymentConfigs).find(c => c.isConnected);
          if (firstConnected) setSelectedProviderId(firstConnected.providerId);
      }
  }, []);

  const allowedCurrencies = useMemo(() => {
      if (!selectedProviderId) return [];
      const supported = GATEWAY_CURRENCIES[selectedProviderId] || ['BRL'];
      return supported.filter(c => ['BRL', 'USD', 'EUR'].includes(c));
  }, [selectedProviderId]);

  const handleProviderSelect = (pid: string) => {
      setSelectedProviderId(pid);
      const supported = GATEWAY_CURRENCIES[pid] || ['BRL'];
      const filteredSupported = supported.filter(c => ['BRL', 'USD', 'EUR'].includes(c));
      if (!filteredSupported.includes(currency)) {
          setCurrency((DEFAULT_CURRENCY_FOR_GATEWAY[pid] || filteredSupported[0] || 'BRL') as CurrencyType);
      }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRawImage(ev.target?.result as string);
        setIsCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedImage = (croppedBase64: string) => {
    setCoverImage(croppedBase64);
    fetch(croppedBase64)
      .then(res => res.blob())
      .then(blob => {
          const file = new File([blob], "group_cover.jpg", { type: "image/jpeg" });
          setSelectedCoverFile(file);
      });
  };

  const handleVipMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files) as File[];
    if (vipMediaItems.length + fileArray.length > 10) {
        alert("Máximo de 10 itens na galeria.");
        return;
    }
    const newEntries = fileArray.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
    }));
    setVipMediaItems(prev => [...prev, ...newEntries]);
  };

  const moveVipMediaItem = (index: number, direction: 'left' | 'right') => {
    const newItems = [...vipMediaItems];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setVipMediaItems(newItems);
  };

  const removeMediaItem = (index: number) => {
      setVipMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      value = value.replace(/\D/g, "");
      if (value === "") { setPrice(""); return; }
      const numericValue = parseFloat(value) / 100;
      setPrice(numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  };

  const handleSavePixel = (data: { pixelId: string, pixelToken: string }) => {
      setPixelId(data.pixelId);
      setPixelToken(data.pixelToken);
  };

    const handleBack = () => {
      navigate('/create-group', { replace: true });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating || isUploading) return;

    if (!selectedProviderId) {
        alert("⚠️ Selecione um provedor de pagamento para continuar.");
        setIsProviderModalOpen(true);
        return;
    }

    const rawPrice = price.replace(/\./g, '').replace(',', '.');
    const numericPrice = parseFloat(rawPrice);
    if (isNaN(numericPrice) || numericPrice < 6.00) {
        alert("⚠️ O preço mínimo para criar um grupo VIP é R$ 6,00.");
        return;
    }

    setIsCreating(true);
    setIsUploading(true);
    
    try {
        const currentUserId = authService.getCurrentUserId();
        const currentUserEmail = authService.getCurrentUserEmail();
        
        const totalToUpload = vipMediaItems.filter(i => i.file).length + (selectedCoverFile ? 1 : 0);
        setUploadTotal(totalToUpload);
        setUploadCurrent(0);
        setUploadProgress(0);

        let finalCoverUrl = coverImage;
        if (selectedCoverFile) {
            setUploadCurrent(prev => prev + 1);
            finalCoverUrl = await postService.uploadMedia(selectedCoverFile, 'avatars');
            setUploadProgress(Math.round((1 / totalToUpload) * 100));
        }

        const uploadedVipMedia: VipMediaItem[] = [];
        const filesToUpload = vipMediaItems.filter(i => i.file);
        const staticItems = vipMediaItems.filter(i => !i.file);

        let uploadedCount = selectedCoverFile ? 1 : 0;

        for (const item of filesToUpload) {
            uploadedCount++;
            setUploadCurrent(uploadedCount);
            const url = await postService.uploadMedia(item.file!, 'vips_doors');
            uploadedVipMedia.push({ url, type: item.type });
            setUploadProgress(Math.round((uploadedCount / totalToUpload) * 100));
        }

        const finalMediaGallery = [...staticItems.map(i => ({ url: i.url, type: i.type })), ...uploadedVipMedia];

        let expirationValue = undefined;
        if (accessType === 'temporary') expirationValue = accessConfig?.interval;
        else if (accessType === 'one_time') expirationValue = `${accessConfig?.days}d${accessConfig?.hours}h`;

        const newGroup: Group = {
          ...({} as any),
          id: Date.now().toString(),
          name: groupName,
          description: description,
          coverImage: finalCoverUrl,
          isVip: true,
          price: numericPrice.toString(),
          currency: currency as any,
          accessType: accessType,
          selectedProviderId: selectedProviderId,
          expirationDate: expirationValue,
          vipDoor: {
            mediaItems: finalMediaGallery,
            text: vipDoorText || "Bem-vindo ao VIP!",
            buttonText: vipButtonText
          },
          lastMessage: "Grupo criado. Configure os conteúdos.",
          time: "Agora",
          creatorId: currentUserId || '',
          creatorEmail: currentUserEmail || undefined,
          memberIds: currentUserId ? [currentUserId] : [],
          adminIds: currentUserId ? [currentUserId] : [],
          status: 'active',
          pixelId: pixelId || undefined,
          pixelToken: pixelToken || undefined
        };
        await groupService.createGroup(newGroup);
        
        setTimeout(() => {
            setIsUploading(false);
            navigate('/groups', { replace: true });
        }, 800);
        
    } catch (e) {
        console.error("Error creating VIP group:", e);
        alert("Erro ao criar grupo VIP. Verifique o console para mais detalhes.");
        setIsCreating(false);
        setIsUploading(false);
    }
  };

  return {
    // States
    groupName,
    description,
    coverImage,
    rawImage,
    vipMediaItems,
    vipDoorText,
    vipButtonText,
    price,
    currency,
    accessType,
    accessConfig,
    selectedProviderId,
    pixelId,
    pixelToken,
    isCreating,
    isUploading,
    uploadProgress,
    uploadCurrent,
    uploadTotal,
    hasProvider,
    
    // State Setters
    setGroupName,
    setDescription,
    setVipDoorText,
    setVipButtonText,
    setAccessType,
    setAccessConfig,
    setCurrency,

    // Modal States
    isProviderModalOpen,
    isPixelModalOpen,
    isAccessModalOpen,
    isCurrencyModalOpen,
    isCropOpen,

    // Modal Setters
    setIsProviderModalOpen,
    setIsPixelModalOpen,
    setIsAccessModalOpen,
    setIsCurrencyModalOpen,
    setIsCropOpen,

    // Handlers
    handleProviderSelect,
    handleCoverChange,
    handleCroppedImage,
    handleVipMediaChange,
    moveVipMediaItem,
    removeMediaItem,
    handlePriceChange,
    handleSavePixel,
    handleSubmit,
    handleBack,

    // Derived values
    allowedCurrencies
  };
};
