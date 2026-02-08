export function countWords(html: string): number {
  if (!html) return 0;

  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  if (text.length === 0) return 0;

  return text.split(/\s+/).length;
}

export function formatWordCount(count: number): string {
  return count.toLocaleString('fr-FR');
}
