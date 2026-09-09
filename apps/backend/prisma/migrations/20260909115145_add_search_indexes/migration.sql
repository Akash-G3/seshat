-- Run after: npx prisma migrate dev --name add_note_organization
-- (append this to that migration, or run as a follow-up migration)
-- Run after the corresponding Prisma migration has created the columns/tables.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS note_title_trgm_idx
  ON "Note" USING gin (title gin_trgm_ops)
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS notebook_title_trgm_idx
  ON "Notebook" USING gin (title gin_trgm_ops)
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS tag_name_trgm_idx
  ON "Tag" USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS document_search_text_trgm_idx
  ON "Document" USING gin ("searchText" gin_trgm_ops);

-- Enforce exactly one target for unified favourites/share links.
ALTER TABLE "Favourite"
  ADD CONSTRAINT favourite_exactly_one_target
  CHECK (("noteId" IS NOT NULL)::int + ("notebookId" IS NOT NULL)::int = 1);

ALTER TABLE "ShareLink"
  ADD CONSTRAINT share_link_exactly_one_target
  CHECK (("noteId" IS NOT NULL)::int + ("notebookId" IS NOT NULL)::int = 1);
