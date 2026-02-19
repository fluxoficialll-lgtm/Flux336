
import { Comment } from '@/backend/RotasDoBackEnd/social';
import { ContentDNA } from "@/types/dna.types";

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  description: string;
  image?: string;
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string;
  timestamp: number;
  comments?: Comment[];
  isAd?: boolean;
  adCampaignId?: string;
  ctaText?: string;
  ctaLink?: string;
  soldCount?: number;
  images?: string[];
  video?: string;
  dna?: ContentDNA | null;
}
