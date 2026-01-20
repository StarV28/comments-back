import sanitizeHtml from "sanitize-html";

export function sanitizeContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ["a", "code", "i", "strong"],
    allowedAttributes: {
      a: ["href", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
