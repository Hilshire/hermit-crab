import { FunctionComponent, useState } from "react";
import Markdown from 'markdown-to-jsx';
import { FormControl, TextField, Button, TableRow, TableCell } from '@material-ui/core';
import { Blog as BlogEntity } from "@server/entity";
import axios from "axios";
import { useSnackbar } from "@hooks";
import { getRepo } from '@utils'

interface Props {
  blogJson: string;
}
type DetailType = 'edit' | 'preview'
const Blog: FunctionComponent<Props> = ({ blogJson }) => {
  const data: BlogEntity = JSON.parse(blogJson)

  const [type, setType] = useState<DetailType>('preview')
  const [title, setTitle] = useState(data.title)
  const [context, setContext] = useState(data.context)
  const { setSnackbar, Snackbar } = useSnackbar()

  return <div className="blog-detail">
    <Button color="primary" onClick={() => setType(type === 'edit' ? 'preview' : 'edit')}>{type === 'edit' ? 'PREVIEW' : 'EDIT' }</Button>
    { type === 'edit' && <Button color="primary" onClick={handleSubmit}>SUBMIT</Button> }
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
    <Snackbar></Snackbar>
  </div>

  function handleSubmit() {
    axios.put('/api/blog/' + data.id, { title, context })
      .then(res => {
          if (res.data.code) {
              setSnackbar(true, 'ok', 'success', location.reload.bind(location));
          } else setSnackbar(true, res.data.message || 'ops!', 'error')
      }, e => {
          setSnackbar(true, e.message || 'ops!', 'error')
      })
  }
}

export async function getServerSideProps({params}) {
  const repo = await getRepo<BlogEntity>(BlogEntity)
  const blog = await repo.findOne(params.id);

  return {
      props: {
          blogJson: JSON.stringify(blog)
      }
  }
}

export default Blog

