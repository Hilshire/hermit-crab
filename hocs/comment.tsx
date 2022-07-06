import Gittalk from 'gitalk';
import 'gitalk/dist/gitalk.css';
import { useEffect, useRef } from 'react';

const clientID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET;
const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

export function CommentHOC(C, key = 'blogJson') {
  const componentWithComment = (props) => {
    const data = props[key] && JSON.parse(props[key]);
    const hookEl = useRef(null);
    let gittalk;
    data && data.id && data.title && (gittalk = new Gittalk({
      clientID,
      clientSecret,
      repo,
      owner,
      admin: [owner],
      title: `[COMMENT ${process.env.NODE_ENV === 'development' ? 'dev' : ''}] ${data.title}`,
      number: data.id,
    }));
    useEffect(() => {
      hookEl.current && gittalk.render(hookEl.current);
    });
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

  return componentWithComment;
}
