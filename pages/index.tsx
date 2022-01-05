import { Blog as BlogEntity } from '@server/entity';
import { getRepo } from '@utils';

export default function Home({ list }) {
  const blogList = JSON.parse(list);
  return (
    <div className="blog-list">
      {blogList.map((b) => <div className="blog-list-item">{b.title}</div>)}
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { page = 1 } = query || {};
  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blog = await repo.find({
    skip: (page - 1) * 5,
    take: 5,
    order: {
      id: 'DESC',
    },
  });
  return {
    props: {
      list: JSON.stringify(blog),
    },
  };
}
