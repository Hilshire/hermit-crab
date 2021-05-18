import { FunctionComponent, useState } from "react";
import { getConnection } from "typeorm";
import Markdown from 'markdown-to-jsx';
import { FormControl, TextField, Button, TableRow, TableCell } from '@material-ui/core';
import { Blog as BlogEntity } from "../../../server/entity";
import { getEnv } from "../../../util";

interface Props {
  blogJson: string;
}
type DetailType = 'edit' | 'preview'
const Blog: FunctionComponent<Props> = ({ blogJson }) => {
  const data: BlogEntity = JSON.parse(blogJson)

  const [type, setType] = useState<DetailType>('preview')
  const [title, setTitle] = useState(data.title)
  const [context, setContext] = useState(data.context)

  return <div className="blog-detail">
    <Button color="primary" onClick={() => setType(type === 'edit' ? 'preview' : 'edit')}>{type === 'edit' ? 'PREVIEW' : 'EDIT' }</Button>
    { type === 'edit' && <Button color="primary" onClick={() => {}}>SUBMIT</Button> }
    <div className="edit-area">
      <div className="edit-section">
        <form>
          <FormControl fullWidth>
            { type === 'edit' ? <TextField id="blog-title" label="blog title" value={title} onChange={(e) => setTitle(e.target.value)} /> : <div>{data.title}</div>}
          </FormControl>
          <FormControl fullWidth>
            {
              type === 'preview' ?
              data.context :
              <TextField  multiline value={context} onChange={(e) => setContext(e.target.value)} />
            }
          </FormControl>
        </form>
      </div>
      <div className="preview-section">
        <Markdown>  
          {`
# ${type === 'preview' ? data.title : title}
${type === 'preview' ? data.context : context}
          `}
        </Markdown>
      </div>
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

