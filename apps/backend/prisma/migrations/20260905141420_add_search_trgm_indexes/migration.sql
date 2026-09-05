-- Enables fuzzy/typo-tolerant matching via trigram similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "note_title_trgm_idx" ON "Note" USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "notebook_title_trgm_idx" ON "Notebook" USING GIN (title gin_trgm_ops);