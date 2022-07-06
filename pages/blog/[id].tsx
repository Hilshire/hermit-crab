import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import { useRouter } from 'next/router';
import { Blog as BlogEntity } from '@server/entity';
import { getRepo } from '@utils';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { NormalComponents, SpecialComponents } from 'react-markdown/src/ast-to-react';
import { CommentHOC } from '@hocs';

const components: Partial<NormalComponents & SpecialComponents> = {
  // @ts-ignore
  code({
    node, inline, className, children, ...props
  }) {
    const match = /language-(\w+)/.exec(className || '');
    const language = (match && match[1]) || 'javascript';
    return !inline ? (
      <SyntaxHighlighter style={nord} language={language} PreTag="div" {...props}>
        { String(children).replace(/\n$/, '') }
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>{children}</code>
    );
  },
};

export function Blog({ blogJson }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const data: BlogEntity = JSON.parse(blogJson);

  const {
    title = 'Ops!', context = 'something went wrong', createAt, lastUpdateAt,
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
        </div>
        <div className="right">
          <img className="banner-image" src={`https://picsum.photos/seed/${title}/768/542`} alt="banner" />
          <div className="image_placeholder" />
        </div>
      </section>
      <ReactMarkdown className="main-content" components={components}>{context}</ReactMarkdown>
    </div>
  );
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { id } = params;
  if (!id) {
    return { notFound: true };
  }
  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blog = await repo.findOne(params.id);
  if (!blog) {
    return { notFound: true };
  }

  return {
    props: {
      blogJson: JSON.stringify(blog),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default CommentHOC(Blog);
