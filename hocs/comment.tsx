import Gittalk from 'gitalk';
import 'gitalk/dist/gitalk.css';
import {
  ComponentType, useEffect, useMemo, useRef,
} from 'react';

const clientID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET;
const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

interface CommentData {
  id: number;
  title: string;
}

function parseCommentData(value: unknown): CommentData | null {
  if (typeof value !== 'string') return null;

  try {
    const data = JSON.parse(value) as Partial<CommentData>;
    return typeof data.id === 'number' && typeof data.title === 'string' ? data as CommentData : null;
  } catch (e) {
    return null;
  }
}

export function CommentHOC<P extends Record<string, unknown>>(C: ComponentType<P>, key: keyof P) {
  const ComponentWithComment = (props: P) => {
    const { [key]: rawData } = props;
    const data = useMemo(() => parseCommentData(rawData), [rawData]);
    const hookEl = useRef<HTMLDivElement | null>(null);
    const gittalk = useMemo(() => {
      if (!data || !clientID || !clientSecret || !repo || !owner) return null;

      return new Gittalk({
        clientID,
        clientSecret,
        repo,
        owner,
        admin: [owner],
        title: `[COMMENT ${process.env.NODE_ENV === 'development' ? 'dev' : ''}] ${data.title}`,
        number: data.id,
      });
    }, [data]);
    useEffect(() => {
      if (hookEl.current && gittalk) gittalk.render(hookEl.current);
    }, [gittalk]);
    const blog = <C {...props}></C>;
    return (
      gittalk ? (
        <>
          { blog }
          <div id="comment-hook" ref={hookEl}></div>
        </>
      ) : blog
    );
  };

  return ComponentWithComment;
}
