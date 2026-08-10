export type BlogContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "image";
      alt: string;
      path: string;
      size?: BlogImageSize;
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    };

export const BLOG_IMAGE_SIZES = ["small", "medium", "large", "full"] as const;
export type BlogImageSize = (typeof BLOG_IMAGE_SIZES)[number];

export const MAX_GFM_TABLE_COLUMNS = 8;
export const MAX_GFM_TABLE_ROWS = 20;

const contentImagePathPattern =
  /^content\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|jpeg|png|webp)$/i;

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function isAllowedContentImagePath(path: string) {
  return (
    path.startsWith("content/") &&
    !path.includes("..") &&
    !path.includes("\\") &&
    !/^(?:https?:|\/\/|javascript:|data:)/i.test(path) &&
    contentImagePathPattern.test(path)
  );
}

function isBlogImageSize(value: string): value is BlogImageSize {
  return BLOG_IMAGE_SIZES.includes(value as BlogImageSize);
}

function parseImageBlock(line: string): BlogContentBlock | null {
  const match = /^!\[([^\]\r\n]{0,500})\]\(([^()\s]+)\)(?:\{(small|medium|large|full)\})?$/.exec(
    line.trim()
  );

  if (!match) {
    return null;
  }

  const [, alt, path, size] = match;

  if (!isAllowedContentImagePath(path)) {
    return null;
  }

  if (size) {
    if (!isBlogImageSize(size)) {
      return null;
    }

    return { type: "image", alt, path, size };
  }

  return { type: "image", alt, path };
}

function splitTableCells(line: string): string[] | null {
  const value = line.trim();

  if (!value.startsWith("|") || !value.endsWith("|")) {
    return null;
  }

  const cells: string[] = [];
  let cell = "";

  for (let index = 1; index < value.length - 1; index += 1) {
    const character = value[index];
    const nextCharacter = value[index + 1];

    if (character === "\\" && nextCharacter === "|") {
      cell += "|";
      index += 1;
      continue;
    }

    if (character === "|") {
      cells.push(cell.trim());
      cell = "";
      continue;
    }

    cell += character;
  }

  cells.push(cell.trim());

  return cells.length > 0 ? cells : null;
}

function isTableSeparator(cells: string[], expectedColumns: number) {
  return (
    cells.length === expectedColumns &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function parseTableBlock(
  lines: string[],
  startIndex: number
): { block: Extract<BlogContentBlock, { type: "table" }>; endIndex: number } | null {
  const headers = splitTableCells(lines[startIndex] ?? "");
  const separator = splitTableCells(lines[startIndex + 1] ?? "");

  if (!headers || !separator || !isTableSeparator(separator, headers.length)) {
    return null;
  }

  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length && lines[index].trim()) {
    const row = splitTableCells(lines[index]);

    if (!row) {
      break;
    }

    if (row.length !== headers.length) {
      return null;
    }

    rows.push(row);
    index += 1;
  }

  if (rows.length === 0) {
    return null;
  }

  return {
    block: { type: "table", headers, rows },
    endIndex: index,
  };
}

export function parseBlogContent(content: string | null | undefined): BlogContentBlock[] {
  const lines = normalizeLineEndings(content ?? "").split("\n");
  const blocks: BlogContentBlock[] = [];
  let paragraphLines: string[] = [];

  function flushParagraph() {
    const text = paragraphLines.join("\n").trim();

    if (text) {
      blocks.push({ type: "paragraph", text });
    }

    paragraphLines = [];
  }

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (!line.trim()) {
      flushParagraph();
      index += 1;
      continue;
    }

    const image = parseImageBlock(line);

    if (image) {
      flushParagraph();
      blocks.push(image);
      index += 1;
      continue;
    }

    const table = parseTableBlock(lines, index);

    if (table) {
      flushParagraph();
      blocks.push(table.block);
      index = table.endIndex;
      continue;
    }

    paragraphLines.push(line);
    index += 1;
  }

  flushParagraph();

  return blocks;
}

function escapeTableCell(value: string) {
  return value
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

export function buildContentImageBlock(
  alt: string,
  path: string,
  size: BlogImageSize = "large"
) {
  const normalizedAlt = alt
    .replace(/[\r\n\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);

  return isAllowedContentImagePath(path) && isBlogImageSize(size)
    ? `![${normalizedAlt}](${path}){${size}}`
    : null;
}

export function buildGfmTable(headers: string[], rows: string[][]) {
  const columnCount = headers.length;
  const normalizedHeaders = headers.map(escapeTableCell);
  const separator = Array.from({ length: columnCount }, () => "---");
  const normalizedRows = rows.map((row) =>
    Array.from({ length: columnCount }, (_, index) =>
      escapeTableCell(row[index] ?? "")
    )
  );
  const formatRow = (cells: string[]) => `| ${cells.join(" | ")} |`;

  return [
    formatRow(normalizedHeaders),
    formatRow(separator),
    ...normalizedRows.map(formatRow),
  ].join("\n");
}

export function buildGfmTableFromTsv(tsv: string) {
  if (typeof tsv !== "string") {
    return null;
  }

  const lines = normalizeLineEndings(tsv).split("\n");

  while (lines.length > 0 && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  if (lines.length < 2) {
    return null;
  }

  const headers = lines[0].split("\t");
  const rows = lines.slice(1).map((line) => line.split("\t"));

  if (
    headers.length === 0 ||
    headers.length > MAX_GFM_TABLE_COLUMNS ||
    rows.length === 0 ||
    rows.length > MAX_GFM_TABLE_ROWS ||
    rows.some((row) => row.length !== headers.length)
  ) {
    return null;
  }

  return buildGfmTable(headers, rows);
}
