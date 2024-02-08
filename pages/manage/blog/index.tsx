import { FunctionComponent, useState, useRef } from 'react';
import { getRepo } from '@utils';
import { Blog as BlogEntity } from '@server/entity';
import {
  FormControl, TextField, Button, TableCell, Container, Select, MenuItem,
} from '@material-ui/core';
import axios from 'axios';
import { useSnackbar, useAlert } from '@hooks';
import { DataTable } from '@components';
import { jwt } from '@middleware';
import { BlogType, blogTextMap } from '@server/entity/type';

interface Props {
  blogsJson: string;
}
const Blogs: FunctionComponent<Props> = ({ blogsJson }) => {
  const [title, setTitle] = useState('');
  const [blogType, setBlogType] = useState(BlogType.COMMON);
  const [context, setContext] = useState('');
  const currentRow = useRef<BlogEntity | null>(null)
  const { setSnackbar, Snackbar } = useSnackbar();
  const { setVisible: setAlertVisible, Alert } = useAlert(deleteBlog)

  const blogs: BlogEntity[] = JSON.parse(blogsJson);

  return (
    <div className="manage">
      <Container component="section">
        <form>
          <FormControl>
            <TextField id="blog-title" label="blog title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl fullWidth>
            <Select
              labelId="Blog Type"
              value={blogType}
              onChange={(e) => setBlogType(e.target.value as BlogType)}
            >
              {
                Object.keys(blogTextMap)
                  .map((key) => <MenuItem key={key} value={key}>{blogTextMap[key]}</MenuItem>)
              }
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <TextField id="blog-content" label="blog content" multiline value={context} onChange={(e) => setContext(e.target.value)} />
          </FormControl>
        </form>
        <Button color="primary" onClick={submit}>submit</Button>
      </Container>

      <Container component="section">
        <DataTable
          data={blogs}
          columns={['id', 'title', 'blogType']}
          heads={['id', 'title', 'blogType']}
          operator={(row) => (
            <TableCell>
              <Button onClick={() => detail(row)}>查看</Button>
              <Button onClick={() => handleDeleteClick(row)}>删除</Button>
            </TableCell>
          )}
          formatter={{
            blogType: (row) => blogTextMap[row.blogType]
          }}
        />
      </Container>
      <Snackbar />
      <Alert>
        <div>
          确定要删除
          {currentRow && currentRow.current?.title}
          吗？
        </div>
      </Alert>
    </div>
  );

  function submit() {
    axios
      .put('/api/blog', { title, context, blogType })
      .then((res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }

  function detail(row) {
    location.href = `/manage/blog/${row.id}`;
  }
  function handleDeleteClick(row) {
    setAlertVisible(true);
    currentRow.current = row;
  }
  function deleteBlog() {
    if (!currentRow.current?.id) return setSnackbar(true, 'no id', 'error');
    const { id } = currentRow.current;
    axios.delete(`/api/blog/${id}`).then(
      (res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops', 'error');
      },
      () => setSnackbar(true, 'ops', 'error'),
    ).finally(() => setAlertVisible(false));
  }
};

export async function getServerSideProps({ req, res }) {
  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blogs = await repo.find({ order: { id: 'DESC' } });

  jwt()(req, res);

  return {
    props: {
      blogsJson: JSON.stringify(blogs),
    },
  };
}

export default Blogs;
