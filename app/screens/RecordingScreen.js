import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RecordingScreen = () => (
  <View style={styles.container}>
    <Text>Recording Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecordingScreen;
