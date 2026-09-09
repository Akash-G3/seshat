import { Prisma } from '@prisma/client';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const collectInlineText = (value: unknown, output: string[]): void => {
  if (typeof value === 'string') {
    output.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectInlineText(item, output);
    return;
  }

  if (!isRecord(value)) return;

  if (typeof value.text === 'string') output.push(value.text);

  // BlockNote commonly stores inline content under `content`, while nested
  // blocks are typically under `children`. Walking every object key keeps the
  // extractor resilient to editor schema additions without coupling the API to
  // a specific BlockNote version.
  for (const [key, child] of Object.entries(value)) {
    if (key === 'text') continue;
    collectInlineText(child, output);
  }
};

export const blockNoteToPlainText = (content: Prisma.JsonValue | unknown): string => {
  const chunks: string[] = [];
  collectInlineText(content, chunks);
  return chunks
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const inlineToMarkdown = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';

  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!isRecord(item)) return '';

      const text = typeof item.text === 'string' ? item.text : '';
      if (!text) return '';

      const styles = isRecord(item.styles) ? item.styles : {};
      let rendered = text;
      if (styles.code) rendered = `\`${rendered}\``;
      if (styles.bold) rendered = `**${rendered}**`;
      if (styles.italic) rendered = `*${rendered}*`;
      if (styles.strike) rendered = `~~${rendered}~~`;
      return rendered;
    })
    .join('');
};

const blockToMarkdown = (block: unknown, depth = 0): string => {
  if (!isRecord(block)) return '';

  const type = typeof block.type === 'string' ? block.type : 'paragraph';
  const props = isRecord(block.props) ? block.props : {};
  const content = inlineToMarkdown(block.content);
  const indent = '  '.repeat(depth);

  let line = content;
  switch (type) {
    case 'heading': {
      const level = Number(props.level ?? 1);
      const safeLevel = Math.min(6, Math.max(1, Number.isFinite(level) ? level : 1));
      line = `${'#'.repeat(safeLevel)} ${content}`;
      break;
    }
    case 'bulletListItem':
      line = `${indent}- ${content}`;
      break;
    case 'numberedListItem':
      line = `${indent}1. ${content}`;
      break;
    case 'checkListItem':
      line = `${indent}- [${props.checked ? 'x' : ' '}] ${content}`;
      break;
    case 'quote':
      line = `> ${content}`;
      break;
    case 'codeBlock':
      line = `\`\`\`\n${content}\n\`\`\``;
      break;
    default:
      line = content;
  }

  const children = Array.isArray(block.children)
    ? block.children.map((child) => blockToMarkdown(child, depth + 1)).filter(Boolean)
    : [];

  return [line, ...children].filter(Boolean).join('\n');
};

export const blockNoteToMarkdown = (content: Prisma.JsonValue | unknown): string => {
  if (!Array.isArray(content)) return '';
  return content.map((block) => blockToMarkdown(block)).filter(Boolean).join('\n\n').trim();
};
