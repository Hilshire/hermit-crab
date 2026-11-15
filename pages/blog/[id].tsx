import { useEffect, useRef } from 'react';
import { createHash } from 'crypto';
import moment from 'moment';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Blog as BlogEntity } from '@server/entity';
import { getRepo } from '@utils';
import { DEFAULT_APP_TITLE } from '@const';
import type { GetServerSideProps } from 'next';
import { IsNull } from 'typeorm';
import { serializeBlogDetail } from '@server/dto';
import type { BlogDetail } from '@server/dto';
import { BlogSeries } from '../../components/BlogSeries';

interface Props {
  blog: BlogDetail | null;
  children: BlogDetail[];
  coverSeed: string;
}

export function Blog({ blog, children = [], coverSeed }: Props) {
  const bannerRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    const appTitle = blog?.title ? `${blog.title} - ${DEFAULT_APP_TITLE}` : DEFAULT_APP_TITLE;
    document.title = appTitle;
  }, [blog?.title]);

  if (router.isFallback || !blog) return <div>Loading...</div>;

  const data = blog;
  const {
    title = 'Ops!', createAt, lastUpdateAt,
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
          {coverSeed && (
            <Image
              className="banner-image"
              src={`https://picsum.photos/seed/${coverSeed}/768/542`}
              alt="banner"
              width={768}
              height={542}
            />
          )}
          <div className="image_placeholder" />
        </div>
      </section>
      <BlogSeries blog={data} entries={children} bannerRef={bannerRef} />
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
  if (blog.parentId) {
    return {
      redirect: { destination: `/blog/${blog.parentId}#blog-${blog.id}`, permanent: false },
    };
  }
  const children = await repo.find({
    where: { parentId: id, deletedAt: IsNull() },
    relations: { tags: true },
    order: { createAt: 'ASC', id: 'ASC' },
  });
  const coverSeed = createHash('md5').update(blog.title, 'utf8').digest('hex');
  return {
    props: {
      blog: serializeBlogDetail(blog),
      children: children.map(serializeBlogDetail),
      coverSeed,
    },
  };
};

export default Blog;
