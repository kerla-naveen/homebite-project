import { useState, useRef } from 'react';
import { paymentApi } from '../api/payment.api';
import { useAuthStore } from '../store/authStore';

export type PaymentResult = 'success' | 'failed' | 'cancelled';

export interface RazorpayPaymentOptions {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  prefill: { name: string; email: string; contact: string };
}

export const useRazorpay = () => {
  const user = useAuthStore((s) => s.user);
  const [paymentOptions, setPaymentOptions] = useState<RazorpayPaymentOptions | null>(null);
  const resolverRef = useRef<((result: PaymentResult) => void) | null>(null);

  const openPayment = async (orderId: string): Promise<PaymentResult> => {
    const res = await paymentApi.createOrder(orderId);
    const { razorpayOrderId, amount, currency, keyId } = res.data.data;

    setPaymentOptions({
      orderId,
      razorpayOrderId,
      amount,
      currency,
      keyId,
      prefill: {
        name: user?.name ?? '',
        email: user?.email ?? '',
        contact: user?.phone ?? '',
      },
    });

    return new Promise<PaymentResult>((resolve) => {
      resolverRef.current = resolve;
    });
  };

  // Called by RazorpayWebView when payment completes/cancels/fails
  const resolvePayment = (result: PaymentResult) => {
    setPaymentOptions(null);
    resolverRef.current?.(result);
    resolverRef.current = null;
  };

  return { paymentOptions, openPayment, resolvePayment };
};
