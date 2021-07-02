import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Blog as BlogEntity } from '@server/entity';
import { getRepo } from '@utils';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { javascript } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { NormalComponents, SpecialComponents } from 'react-markdown/src/ast-to-react';

const components: Partial<NormalComponents & SpecialComponents> = {
  code({
    inline, className, children, ...props
  }) {
    const match = /language-(\w+)/.exec(className || '');
    const language = (match && match[1]) || 'javascript';
    return !inline ? (
      <SyntaxHighlighter style={javascript} language={language} PreTag="div" {...props}>
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

  const { title = 'Ops!', context = 'something went wrong' } = data;

  return (
    <div className="blog">
      <section className="banner">
        <div className="title">{title}</div>
        <Image className="image" src={`https://picsum.photos/seed/${title}/800/1000`} alt="banner" width={800} height={1000} />
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

  };
}

export default Blog;
