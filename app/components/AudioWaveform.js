import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AudioWaveform = () => (
  <View style={styles.container}>
    <Text>AudioWaveform</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AudioWaveform;
