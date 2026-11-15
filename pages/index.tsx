import { IsNull, In } from 'typeorm';
import { serializeDate } from '@server/dto';
import { Blog as BlogEntity } from '@server/entity';
import { BlogType } from '@server/entity/type';
import { getRepo } from '@utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import type { PublicBlogSummary } from '@server/dto';
import { Footer } from '../components/Footer';

interface Props {
  list: PublicBlogSummary[];
  count: number;
}

export default function Home({ list: blogList, count }: Props) {
  const router = useRouter();
  const type = Array.isArray(router.query.type) ? router.query.type[0] || '' : router.query.type || '';
  const page = Number(router.query.page || 1);
  const endPage = count === 0 ? 1 : Math.ceil(count / 5);

  return (
    <>
      <div className="blog-list">
        {blogList.map((b) => (
          <div className="blog-list-item" key={b.id}>
            <Link href={`/blog/${b.id}`}>{b.title}</Link>
            {b.latest && (
            <div className="blog-latest">
              最近更新：
              {b.latest.title}
              {' '}
              ·
              {b.latest.date.slice(0, 10)}
            </div>
            )}
            {b.tags.length > 0 && (
              <sup className="blog-list-tags" aria-label="文章标签">
                {b.tags.map((tag) => (
                  <Link href={`/tag/${tag.id}`} key={tag.id} passHref><span>{tag.name}</span></Link>
                ))}
              </sup>
            )}
          </div>
        ))}
        <div className="pagination">
          {/* TODO: enhance query */}
          {page > 1 && <Link href={`/?type=${type}&page=${page - 1}`}>上一页&nbsp;&nbsp;&nbsp;</Link>}
          {(page < endPage) && <Link href={`/?type=${type}&page=${page + 1}`}>下一页</Link>}
        </div>
      </div>
      {endPage === page && <Footer />}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPage = Number(rawPage || 1);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const rawType = Array.isArray(query.type) ? query.type[0] : query.type;
  const type = rawType || `${BlogType.COMMON}${BlogType.NOTE}`;

  const repo = await getRepo<BlogEntity>(BlogEntity);

  const blogBuilder = repo
    .createQueryBuilder('blog')
    .leftJoinAndSelect('blog.tags', 'tag')
    .select(['blog.title', 'blog.createAt', 'blog.lastUpdateAt', 'blog.id', 'blog.blogType', 'tag.id', 'tag.name'])
    .where('blog.blogType IN (:...types)', { types: type.split('') })
    .andWhere('blog.parentId IS NULL AND blog.deletedAt IS NULL');

  const blog = await blogBuilder
    .skip((page - 1) * 5)
    .take(5)
    .orderBy('blog.createAt', 'DESC')
    .getMany();
  const count = await blogBuilder.getCount();
  const children = blog.length ? await repo.find({
    select: ['id', 'parentId', 'title', 'lastUpdateAt'],
    where: { parentId: In(blog.map((item) => item.id)), deletedAt: IsNull() },
    order: { lastUpdateAt: 'DESC' },
  }) : [];

  return {
    props: {
      list: blog.map(({
        id, title, blogType, tags,
      }) => {
        const latest = children.find((child) => child.parentId === id);
        return ({
          id,
          title,
          blogType,
          tags: tags.map(({ id: tagId, name }) => ({ id: tagId, name })),
          latest: latest ? { title: latest.title, date: serializeDate(latest.lastUpdateAt) } : null,
        });
      }),
      count,
    },
  };
};
