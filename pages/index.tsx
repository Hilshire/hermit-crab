import { Blog as BlogEntity } from '@server/entity';
import { BlogType } from '@server/entity/type';
import { getRepo } from '@utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Footer } from '@components';

export default function Home({ list, count }) {
  const router = useRouter();
  const blogList = JSON.parse(list);
  const { type = '' } = router.query;
  const page = router.query.page as string || 1;
  const endPage = count === 0 ? 1 : Math.ceil(count / 5);

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
          {+page > 1 && <Link href={`/?type=${type}&page=${+page - 1}`}>上一页&nbsp;&nbsp;&nbsp;</Link>}
          {(page < endPage) && <Link href={`/?type=${type}&page=${+page + 1}`}>下一页</Link>}
        </div>
      </div>
      {endPage === +page && <Footer />}
    </>
  );
}

export async function getServerSideProps({ query }) {
  const { page = 1 } = query || {};
  let { type } = query || {}

  if (!type) type = `${BlogType.COMMON}${BlogType.NOTE}`

  const repo = await getRepo<BlogEntity>(BlogEntity);

  const blogBuilder = repo
    .createQueryBuilder('blog')
    .leftJoinAndSelect("blog.tags", "tag")
    .select(['blog.title', 'blog.createAt', 'blog.lastUpdateAt', 'blog.id', 'blog.blogType', 'tag.name'])
    .where('blog.blogType IN (:...types)', { types: type.split('') })


  const blog = await blogBuilder
    .skip((page - 1) * 5)
    .take(5)
    .orderBy('blog.createAt', 'DESC')
    .getMany()
  const count = await blogBuilder.getCount()

  return {
    props: {
      list: JSON.stringify(blog),
      count,
    },
  };
}
