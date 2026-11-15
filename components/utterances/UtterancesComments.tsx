import { useEffect, useRef, useState } from 'react';
import { loadUtterances } from './loadUtterances';
import { useThemeMode } from '../../hooks/useThemeMode';
import { getCommentPreview } from './comment-preview';
import type { CommentPreview } from './comment-preview';

interface Props { term: string; issueNumber?: number | null; standalone?: boolean }

export const UtterancesComments: React.FC<Props> = ({ term, issueNumber, standalone = false }) => {
  const { mode } = useThemeMode();
  const utterancesTheme = mode === 'light' ? 'github-light' : 'photon-dark';
  const themeRef = useRef<'photon-dark' | 'github-light'>(utterancesTheme);
  themeRef.current = utterancesTheme;
  const [open, setOpen] = useState(standalone);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<CommentPreview | null>(null);
  const [widgetStatus, setWidgetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [issue, setIssue] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'ambiguous'>('loading');
  const container = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || visible) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    setStatus('loading');
    setPreview(null);
    setIssue(issueNumber || null);

    getCommentPreview(term, issueNumber).then((result) => {
      if (!active) return;
      setIssue(result.issue);
      setPreview(result.preview);
      setStatus(result.status);
    });
    return () => { active = false; };
  }, [term, issueNumber, visible]);

  useEffect(() => { setOpen(standalone); }, [standalone]);

  useEffect(() => {
    const node = container.current;
    if (!open || status !== 'ready' || !node) return undefined;
    setWidgetStatus('loading');
    return loadUtterances(node, term, issue, () => setWidgetStatus('error'),
      () => setWidgetStatus('ready'), themeRef.current);
  }, [open, term, issue, status, loadAttempt]);

  useEffect(() => {
    const frame = container.current?.querySelector('iframe');
    if (widgetStatus === 'ready' && frame?.contentWindow) {
      frame.contentWindow.postMessage({ type: 'set-theme', theme: utterancesTheme }, 'https://utteranc.es');
    }
  }, [utterancesTheme, widgetStatus]);

  let buttonLabel = preview ? '展开评论' : '发表评论';
  if (status === 'loading') buttonLabel = '正在加载评论…';
  if (status === 'error') buttonLabel = '评论暂不可用';
  if (status === 'ambiguous') buttonLabel = '评论关联不明确';
  if (open) buttonLabel = '收起评论';
  return (
    <div ref={root} className="series-comments">
      {!standalone && preview && (
      <p className="comment-preview">
        最新评论：
        {preview.user.login}
        {' '}
        ·
        {preview.body}
      </p>
      )}
      {!standalone && <button type="button" disabled={status !== 'ready'} onClick={() => setOpen(!open)}>{buttonLabel}</button>}
      {(status === 'error' || status === 'ambiguous') && (
        <p>无法确定评论归属，请稍后重试或在后台指定评论 Issue 编号。</p>
      )}
      {standalone && status === 'loading' && (
        <div className="comment-loading" role="status">
          <span className="comment-spinner" aria-hidden="true" />
          <span>评论加载中</span>
        </div>
      )}
      {open && status === 'ready' && (
        <>
          {widgetStatus === 'error' && (
            <p>
              评论组件加载失败，请检查网络。
              {standalone
                ? <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>重试</button>
                : '请收起并重试。'}
            </p>
          )}
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
