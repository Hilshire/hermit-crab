import { RefObject, useEffect, useState } from 'react';
import moment from 'moment';
import type { BlogDetail } from '@server/dto';
import { BlogMarkdown } from './BlogMarkdown';
import { UtterancesComments } from './utterances/UtterancesComments';
import { SeriesNavigation } from './SeriesNavigation';

interface Props {
  blog: BlogDetail;
  entries: BlogDetail[];
  bannerRef: RefObject<HTMLElement>;
}

function ArticleComments({ blog }: { blog: BlogDetail }) {
  return (
    <UtterancesComments
      term={blog.commentTerm || `${blog.title} - hilshire's blog`}
      issueNumber={blog.commentIssueNumber}
    />
  );
}

export function BlogSeries({ blog, entries, bannerRef }: Props) {
  const [reverse, setReverse] = useState(false);
  const [directory, setDirectory] = useState(false);
  const ordered = reverse ? [...entries].reverse() : entries;

  useEffect(() => { setReverse(localStorage.getItem('blog-series-reverse') === 'true'); }, []);
  return (
    <>
      <SeriesNavigation title={blog.title} entries={entries} reverse={reverse} bannerRef={bannerRef} />
      <div id="blog-intro" className="main-content"><BlogMarkdown content={blog.context} /></div>
      <div className="series-content">
        <ArticleComments blog={blog} />
        {entries.length > 0 && (
          <>
            <div className="series-controls">
              <button type="button" onClick={() => setDirectory(!directory)}>
                目录
                {directory ? '−' : '+'}
              </button>
              <select
                aria-label="子帖排序"
                value={String(reverse)}
                onChange={(event) => {
                  const next = event.target.value === 'true';
                  setReverse(next);
                  localStorage.setItem('blog-series-reverse', String(next));
                }}
              >
                <option value="false">从旧到新</option>
                <option value="true">从新到旧</option>
              </select>
            </div>
            {directory && (
              <div className="series-directory">
                {ordered.map((child) => (
                  <a key={child.id} href={`#blog-${child.id}`} onClick={() => setDirectory(false)}>
                    {moment(child.createAt).format('YYYY-MM-DD')}
                    {' '}
                    {child.title}
                  </a>
                ))}
              </div>
            )}
            {ordered.map((child) => (
              <article className="series-entry" id={`blog-${child.id}`} key={child.id}>
                <h2><a href={`/blog/${child.id}`}>{child.title}</a></h2>
                <div className="series-date">{moment(child.createAt).format('YYYY-MM-DD')}</div>
                <BlogMarkdown className="main-content" content={child.context} />
                <ArticleComments blog={child} />
              </article>
            ))}
          </>
        )}
      </div>
    </>
  );
}
