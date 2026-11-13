import { useMemo } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { Appbar, FAB, Text, Card, Chip, ActivityIndicator, IconButton, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useLibraryStore } from '../src/store/libraryStore';
import { Book } from '../src/db/schema';
import { ThemeToggle } from '../src/components/ThemeToggle';

const STATUS_LABELS = {
  want_to_read: 'Хочу прочитать',
  reading: 'Читаю',
  read: 'Прочитано',
};

const STATUS_COLORS = {
  want_to_read: { bg: '#E0E7FF', text: '#4338CA' },
  reading: { bg: '#FEF3C7', text: '#B45309' },
  read: { bg: '#D1FAE5', text: '#047857' },
};

const FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'want_to_read', label: 'Хочу прочитать' },
  { key: 'reading', label: 'Читаю' },
  { key: 'read', label: 'Прочитано' },
] as const;

export default function LibraryScreen() {
  const { colors } = useTheme();
  const books = useLibraryStore((s) => s.books);
  const filter = useLibraryStore((s) => s.filter);
  const setFilter = useLibraryStore((s) => s.setFilter);
  const isLoading = useLibraryStore((s) => s.isLoading);

  const visibleBooks = useMemo(() => {
    if (filter === 'all') return books;
    return books.filter((b) => b.status === filter);
  }, [books, filter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.surface }} elevated>
        <Appbar.Content title="Моя библиотека" titleStyle={{ color: colors.onSurface, fontWeight: 'bold' }} />
        <Appbar.Action icon="chart-bar" onPress={() => router.push('/stats')} color={colors.onSurface} />
      </Appbar.Header>

      <View style={[styles.filtersRow, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            selected={filter === f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, { backgroundColor: filter === f.key ? colors.primary : colors.surfaceVariant }]}
            textStyle={{ color: filter === f.key ? colors.onPrimary : colors.onSurfaceVariant }}
            showSelectedCheck={false}
          >
            {f.label}
          </Chip>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={visibleBooks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton icon="bookshelf" size={64} iconColor={colors.outline} />
              <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>Здесь пока пусто.</Text>
              <Text style={[styles.emptySub, { color: colors.outline }]}>Нажмите «+», чтобы добавить первую книгу.</Text>
            </View>
          }
          renderItem={({ item }) => <BookCard book={item} />}
        />
      )}

      <ThemeToggle />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/add-book')}
        color={colors.onPrimary}
      />
    </View>
  );
}

function BookCard({ book }: { book: Book }) {
  const { colors } = useTheme();
  const statusColors = STATUS_COLORS[book.status];

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => router.push(`/book/${book.id}`)} mode="elevated" elevation={2}>
      <View style={styles.cardContent}>
        {book.coverUri ? (
          <Image source={{ uri: book.coverUri }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
            <IconButton icon="book-open-page-variant" size={24} iconColor={colors.outline} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text variant="titleMedium" numberOfLines={2} style={[styles.bookTitle, { color: colors.onSurface }]}>
            {book.title}
          </Text>
          <Text variant="bodyMedium" numberOfLines={1} style={[styles.bookAuthor, { color: colors.onSurfaceVariant }]}>
            {book.author || 'Автор не указан'}
          </Text>
          
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.badgeText, { color: statusColors.text }]}>
                {STATUS_LABELS[book.status]}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
    borderBottomWidth: 1,
  },
  chip: { borderRadius: 20 },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  card: { borderRadius: 12 },
  cardContent: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  coverImage: { width: 60, height: 90, borderRadius: 8 },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  bookTitle: { fontWeight: 'bold', marginBottom: 4 },
  bookAuthor: { marginBottom: 8 },
  badgeContainer: { flexDirection: 'row' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  empty: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptySub: { marginTop: 8 },
  fab: { position: 'absolute', right: 16, bottom: 24, borderRadius: 16 },
});