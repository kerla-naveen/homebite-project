import React, { useState } from 'react';
import {
  Modal, View, TouchableOpacity, Text, StyleSheet, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paymentApi } from '../../api/payment.api';
import type { RazorpayPaymentOptions, PaymentResult } from '../../hooks/useRazorpay';

interface Props {
  options: RazorpayPaymentOptions;
  onResult: (result: PaymentResult) => void;
}

// Escape characters that would break the inline JS string
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const buildCheckoutHtml = (opts: RazorpayPaymentOptions) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
</head>
<body style="margin:0;padding:0;background:#fff;">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  var rzp = new Razorpay({
    key: "${esc(opts.keyId)}",
    amount: ${opts.amount},
    currency: "${esc(opts.currency)}",
    name: "HomeBite",
    description: "Food order payment",
    order_id: "${esc(opts.razorpayOrderId)}",
    prefill: {
      name: "${esc(opts.prefill.name)}",
      email: "${esc(opts.prefill.email)}",
      contact: "${esc(opts.prefill.contact)}"
    },
    theme: { color: "#FF6B35" },
    handler: function(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "success",
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      }));
    },
    modal: {
      ondismiss: function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "cancelled" }));
      }
    }
  });
  rzp.on("payment.failed", function(response) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: "failed",
      description: response.error.description
    }));
  });
  rzp.open();
</script>
</body>
</html>
`;

export function RazorpayWebView({ options, onResult }: Props) {
  const insets = useSafeAreaInsets();
  const [verifying, setVerifying] = useState(false);

  const handleMessage = async (event: any) => {
    let msg: any;
    try { msg = JSON.parse(event.nativeEvent.data); } catch { return; }

    if (msg.type === 'success') {
      setVerifying(true);
      try {
        await paymentApi.verifyPayment({
          orderId: options.orderId,
          razorpayOrderId: msg.razorpay_order_id,
          razorpayPaymentId: msg.razorpay_payment_id,
          razorpaySignature: msg.razorpay_signature,
        });
        onResult('success');
      } catch {
        onResult('failed');
      } finally {
        setVerifying(false);
      }
    } else if (msg.type === 'cancelled') {
      onResult('cancelled');
    } else if (msg.type === 'failed') {
      onResult('failed');
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={() => onResult('cancelled')}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onResult('cancelled')} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 32 }} />
        </View>

        {verifying ? (
          <View style={styles.verifying}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.verifyingText}>Verifying payment…</Text>
          </View>
        ) : (
          <WebView
            source={{ html: buildCheckoutHtml(options) }}
            onMessage={handleMessage}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  verifying: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  verifyingText: { fontSize: 15, color: '#6B7280' },
});
