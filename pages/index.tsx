import { Blog as BlogEntity } from '@server/entity';
import { getRepo } from '@utils';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home({ list, count }) {
  const router = useRouter();
  const blogList = JSON.parse(list);
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
          { +page > 1 && <a href={`/?page=${+page - 1}`}>上一页&nbsp;&nbsp;&nbsp;</a> }
          { (page < endPage) && <a href={`/?page=${+page + 1}`}>下一页</a> }
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const { page = 1 } = query || {};
  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blog = await repo.find({
    skip: (page - 1) * 5,
    take: 5,
    select: ['title', 'createAt', 'lastUpdateAt', 'id'],
    order: {
      id: 'DESC',
    },
  });
  const count = await repo.count();
  return {
    props: {
      list: JSON.stringify(blog),
      count,
    },
  };
}
