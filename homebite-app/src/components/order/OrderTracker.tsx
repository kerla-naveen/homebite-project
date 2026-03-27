import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OrderStatus } from '../../constants/orderStatus';

interface Step {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STEPS: Step[] = [
  { key: 'placed',    label: 'Order Placed',       icon: 'receipt-outline'           },
  { key: 'paid',      label: 'Payment Confirmed',   icon: 'card-outline'              },
  { key: 'accepted',  label: 'Accepted by Vendor',  icon: 'thumbs-up-outline'         },
  { key: 'preparing', label: 'Being Prepared',      icon: 'flame-outline'             },
  { key: 'delivery',  label: 'Out for Delivery',    icon: 'bicycle-outline'           },
  { key: 'delivered', label: 'Delivered',           icon: 'checkmark-circle-outline'  },
];

/**
 * Returns 0-based index of the furthest completed step.
 * -1 signals the order is cancelled (special render).
 */
const getActiveIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING_PAYMENT':   return 0;  // placed; payment pending
    case 'PAYMENT_FAILED':    return 0;  // stuck at step 0
    case 'CONFIRMED':         return 1;  // paid; awaiting vendor
    case 'ACCEPTED':          return 2;  // vendor confirmed
    case 'PREPARING':         return 3;
    case 'READY_FOR_PICKUP':  return 3;  // still "preparing" phase
    case 'OUT_FOR_DELIVERY':  return 4;
    case 'DELIVERED':         return 5;
    case 'CANCELLED':         return -1;
    default:                  return 0;
  }
};

interface Props {
  status: OrderStatus;
}

export const OrderTracker: React.FC<Props> = ({ status }) => {
  const isCancelled = status === 'CANCELLED';
  const isPaymentFailed = status === 'PAYMENT_FAILED';
  const activeIndex = getActiveIndex(status);

  if (isCancelled) {
    return (
      <View style={styles.cancelledBox}>
        <Ionicons name="close-circle" size={32} color="#EF4444" />
        <Text style={styles.cancelledTitle}>Order Cancelled</Text>
        <Text style={styles.cancelledSub}>
          This order was cancelled and will not be processed.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isDone    = index <= activeIndex;
        const isActive  = index === activeIndex;
        const isFailed  = isPaymentFailed && index === 1; // payment step failed

        const dotBg = isFailed
          ? '#EF4444'
          : isDone
          ? '#FF6B35'
          : '#F3F4F6';

        const dotBorder = isFailed
          ? '#EF4444'
          : isDone
          ? '#FF6B35'
          : '#E5E7EB';

        const lineColor = index < activeIndex ? '#FF6B35' : '#E5E7EB';
        const isLast    = index === STEPS.length - 1;

        return (
          <View key={step.key} style={styles.stepRow}>
            {/* Left: dot + vertical connector */}
            <View style={styles.dotColumn}>
              <View style={[styles.dot, { backgroundColor: dotBg, borderColor: dotBorder }]}>
                {isFailed ? (
                  <Ionicons name="close" size={13} color="#fff" />
                ) : isDone ? (
                  <Ionicons
                    name={isActive ? step.icon : 'checkmark'}
                    size={isActive ? 13 : 14}
                    color="#fff"
                  />
                ) : (
                  <View style={styles.emptyDot} />
                )}
              </View>
              {!isLast && (
                <View style={[styles.line, { backgroundColor: lineColor }]} />
              )}
            </View>

            {/* Right: label + optional sub-label */}
            <View style={styles.labelColumn}>
              <Text
                style={[
                  styles.label,
                  isActive  && styles.labelActive,
                  isFailed  && styles.labelFailed,
                  !isDone   && styles.labelInactive,
                ]}
              >
                {isFailed && index === 1 ? 'Payment Failed' : step.label}
              </Text>

              {isActive && !isFailed && (
                <Text style={styles.subLabel}>In progress…</Text>
              )}
              {isFailed && (
                <Text style={[styles.subLabel, styles.subLabelError]}>
                  Please retry payment
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },

  // ── Step row ──────────────────────────────────────────────────────────────
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },

  // ── Left column ───────────────────────────────────────────────────────────
  dotColumn: {
    width: 36,
    alignItems: 'center',
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginVertical: 2,
  },

  // ── Right column ──────────────────────────────────────────────────────────
  labelColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 12,
    paddingTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  labelActive: {
    color: '#FF6B35',
    fontSize: 15,
  },
  labelInactive: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  labelFailed: {
    color: '#EF4444',
  },
  subLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  subLabelError: {
    color: '#EF4444',
  },

  // ── Cancelled state ───────────────────────────────────────────────────────
  cancelledBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  cancelledSub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
