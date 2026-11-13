import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const books = sqliteTable('books', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  totalPages: integer('total_pages').default(0).notNull(),
  currentPage: integer('current_page').default(0).notNull(),
  status: text('status', { enum: ['want_to_read', 'reading', 'read'] })
    .default('want_to_read')
    .notNull(),
  coverUri: text('cover_uri'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  finishedAt: integer('finished_at', { mode: 'timestamp' }),
});

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;