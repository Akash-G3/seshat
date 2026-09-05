import { prisma } from '../../config/prisma';

export interface SearchResultRow {
  id: string;
  title: string;
  type: 'note' | 'notebook';
  notebookId: string | null;
  score: number;
}

export const searchService = {
  search: (ownerId: string, query: string, limit = 20) =>
    prisma.$queryRaw<SearchResultRow[]>`
      SELECT id, title, 'note' AS type, "notebookId", similarity(title, ${query}) AS score
      FROM "Note"
      WHERE "ownerId" = ${ownerId}
        AND (title ILIKE '%' || ${query} || '%' OR title % ${query})

      UNION ALL

      SELECT id, title, 'notebook' AS type, NULL AS "notebookId", similarity(title, ${query}) AS score
      FROM "Notebook"
      WHERE "ownerId" = ${ownerId}
        AND (title ILIKE '%' || ${query} || '%' OR title % ${query})

      ORDER BY score DESC
      LIMIT ${limit};
    `,
};