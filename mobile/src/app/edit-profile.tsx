import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.page}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.body}>This screen is a placeholder. Profile editing will be available soon.</Text>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
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
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: Spacing.two,
  },
  body: {
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: Spacing.four,
  },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
