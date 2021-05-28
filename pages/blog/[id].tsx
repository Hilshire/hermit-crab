import Markdown from "markdown-to-jsx";
import { getConnection } from "typeorm";
import { useRouter } from 'next/router'
import { Blog as BlogEntity } from "../../server/entity";
import { prepareConnection } from 'server/connection'

export function Blog({ blogJson }) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  const data: BlogEntity = JSON.parse(blogJson)

  const { title = 'Ops!', context = 'something went wrong' } = data

  return <Markdown>
    {`
# ${title}
${context}
      `}
  </Markdown>
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
  await prepareConnection();
  const connection = getConnection(process.env.NODE_ENV);
  const blog = await connection.getRepository<BlogEntity>(BlogEntity).findOne(params.id);
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
