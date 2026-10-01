import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Blog as BlogEntity, Tag as TagEntity } from '@server/entity';
import { getRepo } from '@utils';
import type { BlogSummary } from '@server/dto';

interface Props {
  tag: { id: number; name: string };
  list: BlogSummary[];
  count: number;
  page: number;
}

export default function TagArticles({
  tag, list, count, page,
}: Props) {
  const endPage = count === 0 ? 1 : Math.ceil(count / 5);

  return (
    <div className="blog-list tag-page">
      <div className="tag-page-header">
        <p className="tag-list-description">
          「
          {tag.name}
          」下的文章：
        </p>
        <Link href="/" className="tag-page-back">← 返回文章列表</Link>
      </div>
      {list.length === 0 && <p className="tag-list-empty">这个标签下还没有文章。</p>}
      {list.map((blog) => (
        <div className="blog-list-item" key={blog.id}>
          <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
        </div>
      ))}
      <div className="pagination">
        {page > 1 && <Link href={`/tag/${tag.id}?page=${page - 1}`}>上一页&nbsp;&nbsp;&nbsp;</Link>}
        {page < endPage && <Link href={`/tag/${tag.id}?page=${page + 1}`}>下一页</Link>}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async ({
  params, query,
}) => {
  const tagId = Number(params?.id);
  if (!Number.isSafeInteger(tagId) || tagId <= 0) return { notFound: true };

  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPage = Number(rawPage || 1);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [tagRepo, blogRepo] = await Promise.all([
    getRepo<TagEntity>(TagEntity),
    getRepo<BlogEntity>(BlogEntity),
  ]);
  const tag = await tagRepo.findOneBy({ id: tagId });
  if (!tag) return { notFound: true };

  const blogQuery = blogRepo
    .createQueryBuilder('blog')
    .innerJoin('blog.tags', 'filterTag', 'filterTag.id = :tagId', { tagId })
    .select(['blog.id', 'blog.title', 'blog.blogType', 'blog.createAt'])
    .orderBy('blog.createAt', 'DESC');
  const [blogs, count] = await Promise.all([
    blogQuery.skip((page - 1) * 5).take(5).getMany(),
    blogRepo
      .createQueryBuilder('blog')
      .innerJoin('blog.tags', 'filterTag', 'filterTag.id = :tagId', { tagId })
      .getCount(),
  ]);

  return {
    props: {
      tag: { id: tag.id, name: tag.name },
      list: blogs.map(({ id, title, blogType }) => ({ id, title, blogType })),
      count,
      page,
    },
  };
};
