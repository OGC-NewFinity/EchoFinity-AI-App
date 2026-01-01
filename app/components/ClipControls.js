import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ClipControls = () => (
  <View style={styles.container}>
    <Text>ClipControls</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ClipControls;
