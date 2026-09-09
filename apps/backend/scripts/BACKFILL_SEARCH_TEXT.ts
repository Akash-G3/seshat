// One-off maintenance script after adding Document.searchText.
// Adjust the import paths if you place this somewhere else in your repository.
import { prisma } from '../src/config/prisma';
import { blockNoteToPlainText } from '../src/shared/utils/documentText';

async function main() {
  const batchSize = 200;
  let cursor: string | undefined;
  let updated = 0;

  while (true) {
    const documents = await prisma.document.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, content: true },
    });
    if (!documents.length) break;

    await prisma.$transaction(
      documents.map((document) =>
        prisma.document.update({
          where: { id: document.id },
          data: { searchText: blockNoteToPlainText(document.content) },
        })
      )
    );

    updated += documents.length;
    cursor = documents.at(-1)!.id;
    console.log(`Backfilled ${updated} documents`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
