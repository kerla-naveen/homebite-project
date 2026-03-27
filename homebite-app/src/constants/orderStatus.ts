export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CONFIRMED: 'CONFIRMED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Awaiting Payment',
  PAYMENT_FAILED: 'Payment Failed',
  CONFIRMED: 'Pending Acceptance',
  ACCEPTED: 'Accepted by Vendor',
  PREPARING: 'Being Prepared',
  READY_FOR_PICKUP: 'Ready for Pickup',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '#F59E0B',
  PAYMENT_FAILED: '#EF4444',
  CONFIRMED: '#3B82F6',
  ACCEPTED: '#8B5CF6',
  PREPARING: '#A855F7',
  READY_FOR_PICKUP: '#06B6D4',
  OUT_FOR_DELIVERY: '#F97316',
  DELIVERED: '#10B981',
  CANCELLED: '#6B7280',
};
