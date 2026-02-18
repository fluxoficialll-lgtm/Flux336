
import React, { useState, useEffect } from 'react';
import { Post, MarketplaceItem } from '../../../types';
import { ProductCard } from '../../marketplace/ProductCard';
import { FeedItem } from './FeedItem';

type RecommendableItem = Post | MarketplaceItem;

interface RecommendedContentProps {
    refId: string;
    refType: 'post' | 'marketplace';
}

export const RecommendedContent: React.FC<RecommendedContentProps> = ({ refId, refType }) => {
    const [recommendations, setRecommendations] = useState<RecommendableItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!refId || !refType) return;

        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/recommendations?refId=${refId}&refType=${refType}&limit=5`);
                if (response.ok) {
                    const data = await response.json();
                    setRecommendations(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [refId, refType]);

    if (isLoading) {
        return <div>Carregando recomendações...</div>;
    }

    if (recommendations.length === 0) {
        return null; // Não renderiza nada se não houver recomendações
    }

    // Helper para verificar se um item é um Post
    const isPost = (item: any): item is Post => 'author_id' in item;

    return (
        <div className="recommended-content-section">
            <h3>Recomendações para você</h3>
            <div className="recommended-items-grid">
                {recommendations.map(item => (
                    isPost(item) 
                        ? <FeedItem post={item} key={item.id} />
                        : <ProductCard item={item} key={item.id} />
                ))}
            </div>
        </div>
    );
};
