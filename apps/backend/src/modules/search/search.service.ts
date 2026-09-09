import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export interface SearchResultRow {
  id: string;
  title: string;
  type: 'note' | 'notebook' | 'tag';
  notebookId: string | null;
  workspaceId: string;
  favourite: boolean;
  snippet: string | null;
  score: number;
}

interface SearchOptions {
  workspaceId?: string;
  type: 'all' | 'note' | 'notebook' | 'tag';
  favouritesOnly: boolean;
  limit: number;
  offset: number;
}

export const searchService = {
  search: async (ownerId: string, query: string, options: SearchOptions) => {
    const workspaceFilter = options.workspaceId
      ? Prisma.sql`AND item."workspaceId" = ${options.workspaceId}`
      : Prisma.empty;
    const typeFilter =
      options.type === 'all' ? Prisma.empty : Prisma.sql`AND item.type = ${options.type}`;
    const favouriteFilter = options.favouritesOnly ? Prisma.sql`AND item.favourite = TRUE` : Prisma.empty;

    return prisma.$queryRaw<SearchResultRow[]>(Prisma.sql`
      WITH item AS (
        SELECT
          n.id,
          n.title,
          'note'::text AS type,
          n."notebookId",
          n."workspaceId",
          EXISTS(
            SELECT 1 FROM "Favourite" f
            WHERE f."ownerId" = ${ownerId} AND f."noteId" = n.id
          ) AS favourite,
          LEFT(d."searchText", 180) AS snippet,
          GREATEST(
            similarity(n.title, ${query}) * 1.8,
            similarity(COALESCE(d."searchText", ''), ${query})
          ) AS score
        FROM "Note" n
        JOIN "Document" d ON d.id = n."documentId"
        WHERE n."ownerId" = ${ownerId}
          AND n."deletedAt" IS NULL
          AND (
            n.title ILIKE '%' || ${query} || '%'
            OR n.title % ${query}
            OR d."searchText" ILIKE '%' || ${query} || '%'
            OR d."searchText" % ${query}
          )

        UNION ALL

        SELECT
          nb.id,
          nb.title,
          'notebook'::text AS type,
          NULL::text AS "notebookId",
          nb."workspaceId",
          EXISTS(
            SELECT 1 FROM "Favourite" f
            WHERE f."ownerId" = ${ownerId} AND f."notebookId" = nb.id
          ) AS favourite,
          NULL::text AS snippet,
          similarity(nb.title, ${query}) * 1.5 AS score
        FROM "Notebook" nb
        WHERE nb."ownerId" = ${ownerId}
          AND nb."deletedAt" IS NULL
          AND (nb.title ILIKE '%' || ${query} || '%' OR nb.title % ${query})

        UNION ALL

        SELECT
          t.id,
          t.name AS title,
          'tag'::text AS type,
          NULL::text AS "notebookId",
          t."workspaceId",
          FALSE AS favourite,
          NULL::text AS snippet,
          similarity(t.name, ${query}) * 1.4 AS score
        FROM "Tag" t
        WHERE t."ownerId" = ${ownerId}
          AND (t.name ILIKE '%' || ${query} || '%' OR t.name % ${query})
      )
      SELECT * FROM item
      WHERE TRUE
      ${workspaceFilter}
      ${typeFilter}
      ${favouriteFilter}
      ORDER BY score DESC, title ASC
      LIMIT ${options.limit}
      OFFSET ${options.offset};
    `);
  },
};
