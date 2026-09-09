-- AlterTable
ALTER TABLE "Notebook" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Notebook_workspaceId_idx" ON "Notebook"("workspaceId");

-- CreateIndex
CREATE INDEX "Notebook_parentId_idx" ON "Notebook"("parentId");

-- AddForeignKey
ALTER TABLE "Notebook" ADD CONSTRAINT "Notebook_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Notebook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
