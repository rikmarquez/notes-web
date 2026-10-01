import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Block-level markdown syntax (headings, lists, quotes, code fences, rules)
const BLOCK_PATTERNS = [
  /^#{1,6}\s+\S/m,
  /^\s*[-*+]\s+\S/m,
  /^\s*\d{1,3}[.)]\s+\S/m, // max 3 digits so "2025. Fue un año..." isn't a list
  /^>\s?/m,
  /^```/m,
  /^\s*(-{3,}|\*{3,}|_{3,})\s*$/m
];

// Inline markdown syntax (bold, italic, code, links)
const INLINE_PATTERNS = [
  /\*\*[^*\n]+\*\*/,
  /__[^_\n]+__/,
  /(^|[^*\w])\*[^*\s][^*\n]*\*(?!\*)/,
  /`[^`\n]+`/,
  /\[[^\]\n]+\]\([^)\s]+\)/
];

const hasBlockSyntax = (text) => BLOCK_PATTERNS.some((re) => re.test(text));

export const looksLikeMarkdown = (text) => {
  if (!text || !text.trim()) return false;
  return hasBlockSyntax(text) || INLINE_PATTERNS.some((re) => re.test(text));
};

// Convert markdown to sanitized HTML that Quill's clipboard can ingest
export const markdownToHtml = (text) => {
  const isSingleLine = !text.trim().includes('\n') && !hasBlockSyntax(text);
  const html = isSingleLine
    ? marked.parseInline(text.trim(), { gfm: true })
    : marked.parse(text, { gfm: true, breaks: true });

  // Drop the trailing newline marked leaves inside code blocks (avoids an empty last line)
  // and the newlines between block tags (Quill turns them into empty paragraphs)
  const cleaned = html
    .replace(/\n<\/code><\/pre>/g, '</code></pre>')
    .replace(/>\n+</g, '><');
  return DOMPurify.sanitize(cleaned);
};

// Quill 1 adds blank lines where blocks have visual margins; markdown never has
// intentional empty paragraphs, so collapse them (code-block lines carry attributes and are kept)
const collapseBlankLines = (ops) => {
  let prevNewline = false;
  return ops
    .map((op) => {
      if (typeof op.insert !== 'string') {
        prevNewline = false;
        return op;
      }
      if (op.attributes) {
        prevNewline = op.insert.endsWith('\n');
        return op;
      }
      let insert = '';
      for (const ch of op.insert) {
        if (ch === '\n' && prevNewline) continue;
        insert += ch;
        prevNewline = ch === '\n';
      }
      return { ...op, insert };
    })
    .filter((op) => op.insert !== '');
};

// Attach a paste handler to a Quill instance that converts pasted markdown into rich text.
// Returns a cleanup function.
export const attachMarkdownPaste = (quill) => {
  const handlePaste = (e) => {
    const clipboard = e.clipboardData || window.clipboardData;
    if (!clipboard) return;

    const text = clipboard.getData('text/plain');
    if (!looksLikeMarkdown(text)) return; // Let Quill handle normal pastes

    e.preventDefault();
    e.stopPropagation();

    const range = quill.getSelection(true);
    if (range.length > 0) {
      quill.deleteText(range.index, range.length, 'user');
    }

    const Delta = quill.constructor.import('delta');
    const converted = quill.clipboard.convert(markdownToHtml(text));
    const pasted = new Delta(collapseBlankLines(converted.ops));
    quill.updateContents(new Delta().retain(range.index).concat(pasted), 'user');
    quill.setSelection(range.index + pasted.length(), 0, 'silent');
  };

  // Capture phase so we run before Quill's own paste handler
  quill.root.addEventListener('paste', handlePaste, true);
  return () => quill.root.removeEventListener('paste', handlePaste, true);
};
