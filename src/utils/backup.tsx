import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { bookRepository } from '../db/repository';

export const exportLibraryToFile = async () => {
  try {
    const books = await bookRepository.getAllBooks();
    const jsonString = JSON.stringify(books, null, 2);
    const fileUri = FileSystem.documentDirectory + 'library_backup.json';
    
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      alert('Сохранено в: ' + fileUri);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Не удалось экспортировать данные');
  }
};

export const importLibraryFromFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return null;

    const fileUri = result.assets[0].uri;
    const jsonString = await FileSystem.readAsStringAsync(fileUri);
    const booksData = JSON.parse(jsonString);

    if (!Array.isArray(booksData)) {
      throw new Error('Неверный формат файла');
    }

    const parsedBooks = booksData.map((book: any) => ({
      ...book,
      createdAt: new Date(book.createdAt),
      updatedAt: new Date(book.updatedAt),
      finishedAt: book.finishedAt ? new Date(book.finishedAt) : null,
    }));

    await bookRepository.importBooks(parsedBooks);
    return parsedBooks.length;
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('Не удалось импортировать данные. Проверьте файл.');
  }
};