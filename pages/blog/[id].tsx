import Markdown from "markdown-to-jsx";
import { getConnection } from "typeorm";
import { useRouter } from 'next/router'
import { Blog as BlogEntity } from "@server/entity";
import { getRepo } from '@utils'

export function Blog({ blogJson }) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  const data: BlogEntity = JSON.parse(blogJson)

  const { title = 'Ops!', context = 'something went wrong' } = data

  return <div className="blog">
    <section className="banner">
      <div className="title">{title}</div>
      <img className="image" src={`https://picsum.photos/seed/${title}/800/1000`}></img>
    </section>
    { <Markdown className="main-content">{context}</Markdown> }
  </div>
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  const { id } = params
  if (!id) {
    return { notFound: true }
  }
  const repo = await getRepo<BlogEntity>(BlogEntity)
  const blog = await repo.findOne(params.id);
  if (!blog) {
    return { notFound: true }
  }

  return {
    props: {
      blogJson: JSON.stringify(blog)
    },

  }
}

export default Blog
