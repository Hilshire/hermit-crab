import { useEffect } from 'react';
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
import { UtterancesComments } from '@components';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { BlogDetail } from '@server/dto';

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
}

export function Blog({ blog }: Props) {
  const router = useRouter();

  useEffect(() => {
    const appTitle = blog?.title ? `${blog.title} - ${DEFAULT_APP_TITLE}` : DEFAULT_APP_TITLE;
    document.title = appTitle;
  }, [blog?.title]);

  if (router.isFallback || !blog) return <div>Loading...</div>;

  const data = blog;
  const {
    title = 'Ops!', context = 'something went wrong', createAt, lastUpdateAt, tags,
  } = data;

  return (
    <div className="blog page-content">
      <section className="banner">
        <div className="left">
          <p className="title">{title}</p>
          <p className="create-time time">
            创建于：
            {moment(createAt).format('YYYY-MM-DD')}
            {' | 最后更新：'}
            {moment(lastUpdateAt).format('YYYY-MM-DD')}
          </p>
          {tags.length > 0 && <p>{tags.map((tag) => tag.name).join(', ')}</p>}
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
      <ReactMarkdown className="main-content" components={components}>{context}</ReactMarkdown>
      <UtterancesComments />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<Props, { id: string }> = async ({ params }) => {
  const { id } = params || {};
  if (!id) {
    return {
      notFound: true,
      revalidate: 60 * 5,
    };
  }
  const blogId = Number(id);
  if (!Number.isInteger(blogId)) {
    return {
      notFound: true,
      revalidate: 60 * 5,
    };
  }
  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blog = await repo.findOne({ where: { id: blogId }, relations: { tags: true } });
  if (!blog) {
    return {
      notFound: true,
      revalidate: 60 * 5,
    };
  }

  return {
    props: {
      blog: {
        id: blog.id,
        title: blog.title,
        context: blog.context,
        blogType: blog.blogType,
        createAt: blog.createAt,
        lastUpdateAt: blog.lastUpdateAt,
        tags: blog.tags.map(({ id: tagId, name, color }) => ({ id: tagId, name, color })),
      },
    },
    revalidate: 60 * 60 * 24,
  };
};

export default Blog;
