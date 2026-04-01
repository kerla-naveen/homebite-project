import api from './axiosInstance';

export const paymentApi = {
  createOrder: (orderId: string) =>
    api.post('/payments/create-order', { orderId }),

  verifyPayment: (payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post('/payments/verify', payload),

  getByOrder: (orderId: string) => api.get(`/payments/${orderId}`),
};
