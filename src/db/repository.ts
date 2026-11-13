import { eq, desc } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from './client';
import { books, NewBook, Book } from './schema';

export const bookRepository = {
  // Добавить книгу
  async addBook(data: Omit<NewBook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    const now = new Date();
    const newBook: NewBook = {
      id: Crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(books).values(newBook);
    return newBook as Book;
  },

  // Получить все книги
  async getAllBooks(): Promise<Book[]> {
    return db.select().from(books).orderBy(desc(books.createdAt));
  },

  // Сменить статус
  async updateStatus(id: string, status: 'want_to_read' | 'reading' | 'read') {
    const now = new Date();
    const updateData: any = { status, updatedAt: now };

    if (status === 'read') {
      updateData.finishedAt = now;
    } else if (status === 'want_to_read') {
      updateData.finishedAt = null;
    }

    await db.update(books).set(updateData).where(eq(books.id, id));
  },

  // Удалить книгу
  async deleteBook(id: string) {
    await db.delete(books).where(eq(books.id, id));
  },

  // Импорт книг пачкой
  async importBooks(booksData: any[]): Promise<void> {
    if (booksData.length > 0) {
      await db.insert(books).values(booksData);
    }
  },
  async updateBook(id: string, data: Partial<Omit<NewBook, 'id' | 'createdAt'>>) {
    await db.update(books)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(books.id, id));
  },
};