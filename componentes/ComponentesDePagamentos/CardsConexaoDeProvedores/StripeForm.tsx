
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useStripe } from './useStripe';

interface StripeFormProps {
    clientSecret: string;
    onSuccess: () => void;
    onFail: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const StripeForm: React.FC<StripeFormProps> = ({ clientSecret, onSuccess, onFail }) => {
    const { StripeIdealForm } = useStripe({ clientSecret, onSuccess, onFail });

    const options = {
        clientSecret,
        appearance: {
            theme: 'night',
            labels: 'floating'
        }
    };

    return (
        <Elements stripe={stripePromise} options={options as any}>
            <StripeIdealForm />
        </Elements>
    );
};
