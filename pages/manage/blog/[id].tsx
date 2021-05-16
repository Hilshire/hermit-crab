import { FunctionComponent } from "react";
import { getConnection } from "typeorm";
import Markdown from 'markdown-to-jsx';
import { Blog as BlogEntity } from "../../../server/entity";
import { getEnv } from "../../../util";

interface Props {
  blogJson: string;
}
const Blog: FunctionComponent<Props> = ({ blogJson }) => {
  const data: BlogEntity = JSON.parse(blogJson)
  return <div className="blog-detail">
    <div className="edit-section">
      {data.context}
    </div>
    <div className="preview-section">
      <Markdown>{data.context}</Markdown>
    </div>
  </div>
}

export async function getServerSideProps({params}) {
  const connection = getConnection(getEnv());
  const blog = await connection.getRepository<BlogEntity>(BlogEntity).findOne(params.id);

  return {
      props: {
          blogJson: JSON.stringify(blog)
      }
  }
}

export default Blog

