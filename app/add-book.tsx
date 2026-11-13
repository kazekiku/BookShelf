// app/add-book.tsx
import { useState, useEffect } from 'react'; // 👈 Добавили useEffect
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Appbar, Snackbar, Text, IconButton, useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router'; // 👈 Добавили useLocalSearchParams
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLibraryStore } from '../src/store/libraryStore';
import { bookRepository } from '../src/db/repository';

export default function AddEditBookScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>(); // 👈 Получаем ID, если он есть
  
  const books = useLibraryStore((s) => s.books);
  const addBook = useLibraryStore((s) => s.addBook);
  const loadBooks = useLibraryStore((s) => s.loadBooks);

  const isEditing = !!id;
  const existingBook = isEditing ? books.find((b) => b.id === id) : null;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  
  const [titleError, setTitleError] = useState('');
  const [pagesError, setPagesError] = useState('');
  const [systemError, setSystemError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 👇 Если это режим редактирования — заполняем поля старыми данными при загрузке
  useEffect(() => {
    if (existingBook) {
      setTitle(existingBook.title);
      setAuthor(existingBook.author || '');
      setPages(existingBook.totalPages.toString());
      setCoverUri(existingBook.coverUri);
    }
  }, [existingBook]);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (titleError) setTitleError('');
  };

  const handlePagesChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setPages(numericText);
    if (pagesError) setPagesError('');
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      setSystemError('Нужен доступ к галерее, чтобы выбрать обложку');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          pickerResult.assets[0].uri,
          [{ resize: { width: 600 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setCoverUri(manipResult.uri);
      } catch (e) {
        setSystemError('Не удалось обработать изображение');
      }
    }
  };

    const handleSave = async () => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError('Название обязательно для заполнения');
      isValid = false;
    }

    const totalPages = parseInt(pages, 10);
    if (!pages || isNaN(totalPages) || totalPages <= 0) {
      setPagesError('Укажите количество страниц (больше 0)');
      isValid = false;
    }

    if (!isValid) return;

    setIsSaving(true);
    try {
      if (isEditing && id) {
        await bookRepository.updateBook(id, {
          title: title.trim(),
          author: author.trim() || null,
          totalPages,
          coverUri,
        });
        await loadBooks();
      } else {
        await addBook({
          title: title.trim(),
          author: author.trim() || null,
          totalPages,
          currentPage: 0,      
          status: 'want_to_read',  
          coverUri,
        });
      }
      router.back();
    } catch (e: any) {
      console.error('Ошибка сохранения:', e); 
      setSystemError('Не удалось сохранить книгу. Проверьте консоль.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.surface }} elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={isEditing ? "Редактировать книгу" : "Новая книга"} />
      </Appbar.Header>

      <View style={styles.form}>
        <View style={styles.coverContainer}>
          {coverUri ? (
            <View style={styles.coverWrapper}>
              <Image source={{ uri: coverUri }} style={styles.coverImage} />
              <IconButton
                icon="close-circle"
                size={24}
                iconColor="red"
                style={styles.removeCoverButton}
                onPress={() => setCoverUri(null)}
              />
            </View>
          ) : (
            <TouchableOpacity style={[styles.addCoverButton, { borderColor: colors.outline, backgroundColor: colors.surfaceVariant }]} onPress={handlePickImage}>
              <IconButton icon="image-plus" size={32} iconColor={colors.primary} />
              <Text style={{ color: colors.onSurfaceVariant, textAlign: "center"}}>Добавить обложку</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          label="Название *"
          value={title}
          onChangeText={handleTitleChange}
          mode="outlined"
          style={styles.input}
          error={!!titleError}
          {...(titleError ? { helperText: titleError } : {})} 
        />

        <TextInput
          label="Автор"
          value={author}
          onChangeText={setAuthor}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Количество страниц *"
          value={pages}
          onChangeText={handlePagesChange}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          error={!!pagesError}
          {...(pagesError ? { helperText: pagesError } : {})}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          style={styles.button}
        >
          {isEditing ? "Сохранить изменения" : "Добавить книгу"}
        </Button>
      </View>

      <Snackbar
        visible={!!systemError}
        onDismiss={() => setSystemError('')}
        duration={3000}
        action={{ label: 'Ок', onPress: () => setSystemError('') }}
      >
        {systemError}
      </Snackbar>
    </View>
  );
}

// Стили остаются такими же, как были у вас
const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16, gap: 12 },
  input: { backgroundColor: 'white' },
  button: { marginTop: 16 },
  coverContainer: { alignItems: 'center', marginBottom: 8 },
  coverWrapper: { position: 'relative' },
  coverImage: { width: 120, height: 180, borderRadius: 8, backgroundColor: '#e0e0e0' },
  removeCoverButton: { position: 'absolute', top: -12, right: -12, backgroundColor: 'white', margin: 0 },
  addCoverButton: {
    width: 120,
    height: 180,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});