import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Timeline = () => (
  <View style={styles.container}>
    <Text>Timeline</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Timeline;
