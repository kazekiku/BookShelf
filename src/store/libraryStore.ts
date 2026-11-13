import { create } from 'zustand';
import { Book } from '../db/schema';
import { bookRepository } from '../db/repository';
import { ThemeType } from '../theme';

type StatusFilter = 'all' | 'want_to_read' | 'reading' | 'read';

interface LibraryState {
  books: Book[];
  filter: StatusFilter;
  isLoading: boolean;
  themeMode: ThemeType;
  loadBooks: () => Promise<void>;
  addBook: (data: Parameters<typeof bookRepository.addBook>[0]) => Promise<void>;
  setFilter: (filter: StatusFilter) => void;
  setThemeMode: (mode: ThemeType) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  filter: 'all',
  isLoading: false,
  themeMode: 'light',

  loadBooks: async () => {
    set({ isLoading: true });
    try {
      const books = await bookRepository.getAllBooks();
      set({ books, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  addBook: async (data) => {
    await bookRepository.addBook(data);
    await get().loadBooks();
  },

  setFilter: (filter) => set({ filter }),
  setThemeMode: (mode) => set({ themeMode: mode }),
}));