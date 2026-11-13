import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLibraryStore } from '../src/store/libraryStore';
import { themes } from '../src/theme';

export default function RootLayout() {
  const loadBooks = useLibraryStore((s) => s.loadBooks);
  const themeMode = useLibraryStore((s) => s.themeMode);
  const activeTheme = themes[themeMode];

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={activeTheme}>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="add-book" />
          <Stack.Screen name="book/[id]" />
          <Stack.Screen name="stats" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}