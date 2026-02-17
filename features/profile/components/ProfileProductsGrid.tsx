
import React from 'react';
import { marketplaceService } from '../../../services/marketplaceService';
import { ProductCard } from '../../../components/marketplace/ProductCard';

interface ProfileProductsGridProps {
    userId: string;
}

export const ProfileProductsGrid: React.FC<ProfileProductsGridProps> = ({ userId }) => {

    const products = marketplaceService.getProductsByUserId(userId);

    if (products.length === 0) return <div className="text-center text-gray-400 mt-8">Nenhum produto na loja.</div>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(product => (
                <ProductCard key={product.id} item={product} />
            ))}
        </div>
    );
};
