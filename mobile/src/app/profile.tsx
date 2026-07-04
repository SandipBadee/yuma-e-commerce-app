"use client";

import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.page}>
        <ThemedText type="subtitle" style={styles.title}>
          Profile
        </ThemedText>
        <ThemedText type="default" style={styles.body}>
          Manage your account, addresses, and orders here.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    justifyContent: 'center',
  },
  title: {
    marginBottom: Spacing.two,
  },
  body: {
    color: '#6b7280',
    lineHeight: 24,
  },
});
