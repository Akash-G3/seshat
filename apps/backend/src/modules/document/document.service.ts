// import { Prisma } from '@prisma/client';
// import { prisma } from '../../config/prisma';

// type BlockNoteContent = Prisma.InputJsonValue;

// export const documentService = {
//   create: (ownerId: string, content: BlockNoteContent = []) =>
//     prisma.document.create({ data: { ownerId, content } }),

//   update: (id: string, content: BlockNoteContent) =>
//     prisma.document.update({ where: { id }, data: { content } }),
// };

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { blockNoteToPlainText } from '../../shared/utils/documentText';

type BlockNoteContent = Prisma.InputJsonValue;

export const documentService = {
  create: (ownerId: string, content: BlockNoteContent = []) =>
    prisma.document.create({
      data: { ownerId, content, searchText: blockNoteToPlainText(content) },
    }),

  update: (id: string, content: BlockNoteContent) =>
    prisma.document.update({
      where: { id },
      data: { content, searchText: blockNoteToPlainText(content) },
    }),
};
