import { StyleSheet, Text, View } from 'react-native';

export function EmptyState({ message }: { message: string }) {
  return (
    <View
      accessible
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#F8FAFB',
    padding: 14,
  },
  text: {
    color: '#64727C',
    fontSize: 14,
    lineHeight: 20,
  },
});
