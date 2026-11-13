import { useLocalSearchParams, router } from 'expo-router';
import { View, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Appbar, Text, Button, Divider, IconButton, useTheme } from 'react-native-paper';
import { useLibraryStore } from '../../src/store/libraryStore';
import { bookRepository } from '../../src/db/repository';

export default function BookDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useLibraryStore((state) => state.books.find((b) => b.id === id));
  const loadBooks = useLibraryStore((state) => state.loadBooks);

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Appbar.Header style={{ backgroundColor: colors.surface }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Книга не найдена" />
        </Appbar.Header>
      </View>
    );
  }

  const handleStatusChange = async (newStatus: 'want_to_read' | 'reading' | 'read') => {
    await bookRepository.updateStatus(book.id, newStatus);
    await loadBooks();
  };

  const handleDelete = () => {
    Alert.alert('Удалить книгу?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await bookRepository.deleteBook(book.id);
          await loadBooks();
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.surface }} elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="О книге" />
        <Appbar.Action 
          icon="pencil" 
          onPress={() => router.push(`/add-book?id=${book.id}`)} 
        />
        
        <Appbar.Action icon="trash-can-outline" onPress={handleDelete} iconColor="#EF4444" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.coverSection}>
          {book.coverUri ? (
            <Image source={{ uri: book.coverUri }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
              <IconButton icon="book-open-page-variant" size={64} iconColor={colors.outline} />
            </View>
          )}
          <Text variant="headlineSmall" style={[styles.title, { color: colors.onSurface }]}>{book.title}</Text>
          <Text variant="titleMedium" style={[styles.author, { color: colors.onSurfaceVariant }]}>
            {book.author || 'Автор не указан'}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.outline }}>
            {book.totalPages} стр.
          </Text>
          {book.status === 'read' && book.finishedAt && (
            <Text variant="bodySmall" style={{ color: colors.primary, marginTop: 8 }}>
              Прочитано: {new Date(book.finishedAt).toLocaleDateString('ru-RU')}
            </Text>
          )}
        </View>

        <Divider style={{ marginVertical: 24 }} />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Статус чтения
        </Text>
        
        <View style={styles.statusButtons}>
          <Button
            mode={book.status === 'want_to_read' ? 'contained' : 'outlined'}
            onPress={() => handleStatusChange('want_to_read')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Хочу прочитать
          </Button>
          <Button
            mode={book.status === 'reading' ? 'contained' : 'outlined'}
            onPress={() => handleStatusChange('reading')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Читаю
          </Button>
          <Button
            mode={book.status === 'read' ? 'contained' : 'outlined'}
            onPress={() => handleStatusChange('read')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Прочитано
          </Button>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  coverSection: { alignItems: 'center', marginBottom: 16 },
  coverImage: {
    width: 160,
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  author: { textAlign: 'center', marginBottom: 8 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
  statusButtons: { gap: 12 },
  button: { borderRadius: 12 },
  buttonContent: { paddingVertical: 8 },
});