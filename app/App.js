import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screen components
import OnboardingScreen from './screens/OnboardingScreen';
import RecordingScreen from './screens/RecordingScreen';
import EditingScreen from './screens/EditingScreen';
import ExportScreen from './screens/ExportScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ title: 'Onboarding' }}
        />
        <Stack.Screen
          name="Recording"
          component={RecordingScreen}
          options={{ title: 'Recording' }}
        />
        <Stack.Screen
          name="Editing"
          component={EditingScreen}
          options={{ title: 'Editing' }}
        />
        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{ title: 'Export' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
