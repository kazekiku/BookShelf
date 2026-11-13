import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, Card, useTheme, Button, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useLibraryStore } from '../src/store/libraryStore';
import { exportLibraryToFile, importLibraryFromFile } from '../src/utils/backup';

export default function StatsScreen() {
  const { colors } = useTheme();
  const books = useLibraryStore((state) => state.books);
  const loadBooks = useLibraryStore((state) => state.loadBooks);

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const total = books.length;
  const read = books.filter((b) => b.status === 'read').length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const readThisMonth = books.filter((b) => {
    if (b.status !== 'read' || !b.finishedAt) return false;
    const d = new Date(b.finishedAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const addedThisMonth = books.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      await exportLibraryToFile();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      const count = await importLibraryFromFile();
      if (count) {
        await loadBooks();
        setMessage(`Успешно импортировано ${count} книг!`);
      }
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.surface }} elevated>
        <Appbar.BackAction onPress={() => router.back()} color={colors.onSurface} />
        <Appbar.Content title="Статистика" titleStyle={{ color: colors.onSurface }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          В этом месяце
        </Text>
        <View style={styles.row}>
          <Card style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text variant="displaySmall" style={{ color: '#10B981' }}>{readThisMonth}</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Прочитано</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text variant="displaySmall" style={{ color: '#4F46E5' }}>{addedThisMonth}</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Добавлено</Text>
            </Card.Content>
          </Card>
        </View>

        <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24, color: colors.onSurface }]}>
          Всего в библиотеке
        </Text>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.cardContentRow}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineMedium" style={{ color: colors.onSurface }}>{total}</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Книг</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineMedium" style={{ color: '#10B981' }}>{read}</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Прочитано</Text>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24, color: colors.onSurface }]}>
          Резервная копия
        </Text>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={{ gap: 12 }}>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              Сохраните свои книги в файл, чтобы не потерять их при смене телефона.
            </Text>
            <Button 
              mode="outlined" 
              icon="download" 
              onPress={handleExport}
              disabled={isProcessing}
            >
              Экспорт библиотеки
            </Button>
            <Button 
              mode="outlined" 
              icon="upload" 
              onPress={handleImport}
              disabled={isProcessing}
            >
              Импорт библиотеки
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage('')}
        duration={3000}
        action={{ label: 'Ок', onPress: () => setMessage('') }}
      >
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1 },
  card: { elevation: 2 },
  cardContent: { alignItems: 'center', paddingVertical: 16 },
  cardContentRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 },
});