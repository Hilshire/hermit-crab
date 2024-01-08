import { Blog as BlogEntity } from '@server/entity';
import { BlogType } from '@server/entity/type';
import { getRepo } from '@utils';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home({ list, count }) {
  const router = useRouter();
  const blogList = JSON.parse(list);
  const { type = '' } = router.query;
  const page = router.query.page as string || 1;
  const endPage = count / 5;

  return (
    <>
      <div className="blog-list">
        {blogList.map((b) => (
          <Link
            key={b.id}
            href={`/blog/${b.id}`}
          >
            <div className="blog-list-item">{b.title}</div>
          </Link>
        ))}
        <div className="pagination">
          {/* TODO: enhance query */}
          { +page > 1 && <Link href={`/?type=${type}&page=${+page - 1}`}>上一页&nbsp;&nbsp;&nbsp;</Link> }
          { (page < endPage) && <Link href={`/?type=${type}&page=${+page + 1}`}>下一页</Link> }
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const { page = 1, type = BlogType.COMMON } = query || {};
  const repo = await getRepo<BlogEntity>(BlogEntity);

  const where = { blogType: type || BlogType.COMMON };
  const blog = await repo.find({
    where,
    skip: (page - 1) * 5,
    take: 5,
    select: ['title', 'createAt', 'lastUpdateAt', 'id'],
    order: {
      id: 'DESC',
    },
  });
  const count = await repo.count({ where });
  return {
    props: {
      list: JSON.stringify(blog),
      count,
    },
  };
}
