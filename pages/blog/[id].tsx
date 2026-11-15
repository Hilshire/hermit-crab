import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Blog as BlogEntity } from '@server/entity';
import { getRepo } from '@utils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { CodeComponent, NormalComponents, SpecialComponents } from 'react-markdown/src/ast-to-react';
import { DEFAULT_APP_TITLE } from '@const';
import type { GetServerSideProps } from 'next';
import { IsNull } from 'typeorm';
import { serializeDate } from '@server/dto';
import type { BlogDetail, TagDto } from '@server/dto';
import { UtterancesComments } from '../../components/UtterancesComments';

const components: Partial<NormalComponents & SpecialComponents> = {
  // @ts-ignore
  code({
    node, inline, className, children, ...props
  }: Parameters<CodeComponent>[0]) {
    const match = /language-(\w+)/.exec(className || '');
    const language = (match && match[1]) || 'javascript';
    return !inline ? (
      <SyntaxHighlighter style={nord} language={language} PreTag="div">
        { String(children).replace(/\n$/, '') }
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>{children}</code>
    );
  },
};

interface Props {
  blog: BlogDetail | null;
  children: BlogDetail[];
}

export function Blog({ blog, children = [] }: Props) {
  const [reverse, setReverse] = useState(false);
  const [directory, setDirectory] = useState(false);
  const [showRail, setShowRail] = useState(false);
  const [activeEntry, setActiveEntry] = useState<number | null>(null);
  const [railLabel, setRailLabel] = useState<{ title: string; top: number } | null>(null);
  const bannerRef = useRef<HTMLElement>(null);
  useEffect(() => { setReverse(localStorage.getItem('blog-series-reverse') === 'true'); }, []);
  const router = useRouter();

  useEffect(() => {
    const appTitle = blog?.title ? `${blog.title} - ${DEFAULT_APP_TITLE}` : DEFAULT_APP_TITLE;
    document.title = appTitle;
  }, [blog?.title]);

  useEffect(() => {
    if (!blog || !children.length) return undefined;
    const update = () => {
      const banner = bannerRef.current;
      setShowRail(!!banner && banner.getBoundingClientRect().bottom <= 0);
      let current: number | null = null;
      const ordered = reverse ? [...children].reverse() : children;
      ordered.forEach((child) => {
        const element = document.getElementById(`blog-${child.id}`);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.35) {
          current = child.id;
        }
      });
      setActiveEntry(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [blog, children, reverse]);

  if (router.isFallback || !blog) return <div>Loading...</div>;

  function showRailLabel(element: HTMLElement, label: string) {
    const rect = element.getBoundingClientRect();
    setRailLabel({ title: label, top: rect.top + rect.height / 2 });
  }

  const data = blog;
  const {
    title = 'Ops!', context = 'something went wrong', createAt, lastUpdateAt,
  } = data;

  return (
    <div className="blog page-content">
      <section className="banner" ref={bannerRef}>
        <div className="left">
          <p className="title">{title}</p>
          <p className="create-time time">
            创建于：
            {moment(createAt).format('YYYY-MM-DD')}
            {' | 最后更新：'}
            {moment(lastUpdateAt).format('YYYY-MM-DD')}
          </p>
        </div>
        <div className="right">
          <Image
            className="banner-image"
            src={`https://picsum.photos/seed/${title}/768/542`}
            alt="banner"
            width={768}
            height={542}
          />
          <div className="image_placeholder" />
        </div>
      </section>
      {children.length > 0 && showRail && (
        <nav className="series-rail" aria-label="文章导航">
          <a
            href="#blog-intro"
            className={activeEntry === null ? 'is-active' : ''}
            aria-label={title}
            onMouseEnter={(event) => showRailLabel(event.currentTarget, title)}
            onMouseLeave={() => setRailLabel(null)}
            onFocus={(event) => showRailLabel(event.currentTarget, title)}
            onBlur={() => setRailLabel(null)}
          >
            <span className="series-rail-line" />
          </a>
          {(reverse ? [...children].reverse() : children).map((child) => (
            <a
              key={child.id}
              href={`#blog-${child.id}`}
              className={activeEntry === child.id ? 'is-active' : ''}
              aria-label={child.title}
              onMouseEnter={(event) => showRailLabel(event.currentTarget, child.title)}
              onMouseLeave={() => setRailLabel(null)}
              onFocus={(event) => showRailLabel(event.currentTarget, child.title)}
              onBlur={() => setRailLabel(null)}
            >
              <span className="series-rail-line" />
            </a>
          ))}
        </nav>
      )}
      {showRail && railLabel && (
        <div className="series-rail-tooltip" style={{ top: railLabel.top }} aria-hidden="true">
          {railLabel.title}
        </div>
      )}
      <div id="blog-intro" className="main-content">
        <ReactMarkdown components={components}>{context}</ReactMarkdown>
      </div>
      <div className="series-content">
        <UtterancesComments term={data.commentTerm || `${data.title} - hilshire's blog`} issueNumber={data.commentIssueNumber} />
        {children.length > 0 && (
        <>
          <div className="series-controls">
            <button type="button" onClick={() => setDirectory(!directory)}>
              目录
              {directory ? '−' : '+'}
            </button>
            <select aria-label="子帖排序" value={String(reverse)} onChange={(e) => { const next = e.target.value === 'true'; setReverse(next); localStorage.setItem('blog-series-reverse', String(next)); }}>
              <option value="false">从旧到新</option>
              <option value="true">从新到旧</option>
            </select>
          </div>
          {directory && (
          <div className="series-directory">
            {(reverse ? [...children].reverse() : children).map((child) => (
              <a key={child.id} href={`#blog-${child.id}`} onClick={() => setDirectory(false)}>
                {moment(child.createAt).format('YYYY-MM-DD')}
                {' '}
                {child.title}
              </a>
            ))}
          </div>
          )}
          {(reverse ? [...children].reverse() : children).map((child) => (
            <article className="series-entry" id={`blog-${child.id}`} key={child.id}>
              <h2><a href={`/blog/${child.id}`}>{child.title}</a></h2>
              <div className="series-date">{moment(child.createAt).format('YYYY-MM-DD')}</div>
              <ReactMarkdown className="main-content" components={components}>{child.context}</ReactMarkdown>
              <UtterancesComments term={child.commentTerm || `${child.title} - hilshire's blog`} issueNumber={child.commentIssueNumber} />
            </article>
          ))}
        </>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async ({ params }) => {
  const id = Number(params?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return { notFound: true };
  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blog = await repo.findOne({
    where: { id, deletedAt: IsNull() }, relations: { tags: true },
  });
  if (!blog) return { notFound: true };
  if (blog.parentId) return { redirect: { destination: `/blog/${blog.parentId}#blog-${blog.id}`, permanent: false } };
  const children = await repo.find({ where: { parentId: id, deletedAt: IsNull() }, relations: { tags: true }, order: { createAt: 'ASC', id: 'ASC' } });
  const serialize = (item: BlogEntity): BlogDetail => ({
    id: item.id,
    title: item.title,
    context: item.context,
    blogType: item.blogType,
    createAt: serializeDate(item.createAt),
    lastUpdateAt: serializeDate(item.lastUpdateAt),
    parentId: item.parentId,
    commentTerm: item.commentTerm,
    commentIssueNumber: item.commentIssueNumber,
    tags: item.tags.map((tag: TagDto) => ({ id: tag.id, name: tag.name, color: tag.color })),
  });
  return { props: { blog: serialize(blog), children: children.map(serialize) } };
};

export default Blog;
