import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PostProvider } from './src/context/PostContext';
import { RootNavigator } from './src/navigation/RootNavigator';

import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PostProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </PostProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
