import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const Loader: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'large' }) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color="#FF6B35" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
