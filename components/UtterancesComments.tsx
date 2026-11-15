import { useEffect, useRef, useState } from 'react';
import { loadUtterances } from './loadUtterances';

interface Props { term: string; issueNumber?: number | null }
interface Preview { user: { login: string }; body: string; created_at: string }

export const UtterancesComments: React.FC<Props> = ({ term, issueNumber }) => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [widgetStatus, setWidgetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [issue, setIssue] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'ambiguous'>('loading');
  const container = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setPreview(null);
    setIssue(issueNumber || null);

    async function loadPreview() {
      let matchedIssue = issueNumber || null;
      try {
        let commentCount: number | null = null;
        if (!matchedIssue) {
          const legacyTitle = term.endsWith(" - hilshire's blog")
            ? term.slice(0, -" - hilshire's blog".length) : null;
          const searchTerm = legacyTitle || term;
          const search = `repo:Hilshire/hermit-crab is:issue in:title "${searchTerm.replace(/"/g, '')}"`;
          const response = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(search)}&per_page=100`);
          if (!response.ok) throw new Error('comments unavailable');
          const result = await response.json();
          const matches = result.items.filter((item: { title: string }) => item.title === term);
          if (!active) return;
          const devMatches = legacyTitle
            ? result.items.filter((item: { title: string }) => item.title === `${legacyTitle} - dev blog`)
            : [];
          if (matches.length > 1 || (!matches.length && devMatches.length)
            || result.incomplete_results || result.total_count > 100) {
            setStatus('ambiguous');
            return;
          }
          matchedIssue = matches[0]?.number || null;
          commentCount = matches[0]?.comments ?? null;
        }
        if (!active) return;
        setIssue(matchedIssue);
        setStatus('ready');
        if (!matchedIssue) return;
        if (commentCount === null) {
          const issueResponse = await fetch(`https://api.github.com/repos/Hilshire/hermit-crab/issues/${matchedIssue}`);
          if (!issueResponse.ok) throw new Error('comments unavailable');
          const issueData = await issueResponse.json();
          commentCount = issueData.comments;
        }
        if (!commentCount) return;
        const page = Math.ceil(commentCount / 100);
        const response = await fetch(`https://api.github.com/repos/Hilshire/hermit-crab/issues/${matchedIssue}/comments?per_page=100&page=${page}`);
        if (!response.ok) throw new Error('comments unavailable');
        const comments = await response.json();
        if (active && comments.length) setPreview(comments[comments.length - 1]);
      } catch {
        if (active) setStatus(matchedIssue || term.startsWith('hermit-crab-blog-') ? 'ready' : 'error');
      }
    }
    loadPreview();
    return () => { active = false; };
  }, [term, issueNumber]);

  useEffect(() => {
    const node = container.current;
    if (!open || !node) return undefined;
    setWidgetStatus('loading');
    return loadUtterances(node, term, issue, () => setWidgetStatus('error'),
      () => setWidgetStatus('ready'));
  }, [open, term, issue]);

  let buttonLabel = preview ? '展开评论' : '发表评论';
  if (status === 'loading') buttonLabel = '正在加载评论…';
  if (status === 'error') buttonLabel = '评论暂不可用';
  if (status === 'ambiguous') buttonLabel = '评论关联不明确';
  if (open) buttonLabel = '收起评论';
  return (
    <div className="series-comments">
      {preview && (
      <p className="comment-preview">
        最新评论：
        {preview.user.login}
        {' '}
        ·
        {preview.body}
      </p>
      )}
      <button type="button" disabled={status !== 'ready'} onClick={() => setOpen(!open)}>{buttonLabel}</button>
      {(status === 'error' || status === 'ambiguous') && (
        <p>无法确定评论归属，请稍后重试或在后台指定评论 Issue 编号。</p>
      )}
      {open && (
        <>
          {widgetStatus === 'error' && <p>评论组件加载失败，请检查网络后收起并重试。</p>}
          {widgetStatus === 'loading' && (
            <div className="comment-loading" role="status">
              <span className="comment-spinner" aria-hidden="true" />
              <span>评论加载中</span>
            </div>
          )}
          <section
            ref={container}
            className={`utterances-comments-hook${widgetStatus !== 'ready' ? ' is-loading' : ''}`}
            aria-hidden={widgetStatus !== 'ready'}
          />
        </>
      )}
    </div>
  );
};
