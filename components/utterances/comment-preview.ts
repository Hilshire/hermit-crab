export interface CommentPreview {
  user: { login: string };
  body: string;
  created_at: string;
}

export interface CommentResult {
  status: 'ready' | 'error' | 'ambiguous';
  issue: number | null;
  preview: CommentPreview | null;
  retry?: boolean;
}

// Cache resolved lookups briefly and share in-flight requests between mounted components.
const cache = new Map<string, { expires: number; request: Promise<CommentResult> }>();
const CACHE_MS = 5 * 60 * 1000;

async function readJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('comments unavailable');
  return response.json();
}

async function resolvePreview(term: string, issueNumber?: number | null): Promise<CommentResult> {
  let issue = issueNumber || null;
  try {
    let commentCount: number | null = null;
    if (!issue) {
      const legacyTitle = term.endsWith(" - hilshire's blog")
        ? term.slice(0, -" - hilshire's blog".length) : null;
      const searchTerm = legacyTitle || term;
      const search = `repo:Hilshire/hermit-crab is:issue in:title "${searchTerm.replace(/"/g, '')}"`;
      const result = await readJson(`https://api.github.com/search/issues?q=${encodeURIComponent(search)}&per_page=100`);
      const matches = result.items.filter((item: { title: string }) => item.title === term);
      const devMatches = legacyTitle
        ? result.items.filter((item: { title: string }) => item.title === `${legacyTitle} - dev blog`)
        : [];
      if (matches.length > 1 || (!matches.length && devMatches.length)
        || result.incomplete_results || result.total_count > 100) {
        return { status: 'ambiguous', issue: null, preview: null };
      }
      issue = matches[0]?.number || null;
      commentCount = matches[0]?.comments ?? null;
    }
    if (!issue) return { status: 'ready', issue: null, preview: null };
    if (commentCount === null) {
      const data = await readJson(`https://api.github.com/repos/Hilshire/hermit-crab/issues/${issue}`);
      commentCount = data.comments;
    }
    if (!commentCount) return { status: 'ready', issue, preview: null };
    const page = Math.ceil(commentCount / 100);
    const comments = await readJson(`https://api.github.com/repos/Hilshire/hermit-crab/issues/${issue}/comments?per_page=100&page=${page}`);
    return { status: 'ready', issue, preview: comments[comments.length - 1] || null };
  } catch {
    return {
      status: issue || term.startsWith('hermit-crab-blog-') ? 'ready' : 'error',
      issue,
      preview: null,
      retry: true,
    };
  }
}

export function getCommentPreview(term: string, issueNumber?: number | null) {
  const key = `${issueNumber || ''}:${term}`;
  const previous = cache.get(key);
  if (previous && previous.expires > Date.now()) return previous.request;
  const request = resolvePreview(term, issueNumber).then((result) => {
    if (result.status !== 'ready' || result.retry) cache.delete(key);
    return result;
  });
  cache.set(key, { expires: Date.now() + CACHE_MS, request });
  return request;
}
