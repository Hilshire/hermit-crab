import { FunctionComponent, useState, useRef } from 'react';
import type { GetServerSideProps } from 'next';
import { getRepo } from '@utils';
import { Blog as BlogEntity } from '@server/entity';
import {
  FormControl, TextField, Button, TableCell, Container, Select, MenuItem,
} from '@material-ui/core';
import axios from 'axios';
import { useSnackbar, useAlert } from '@hooks';
import { DataTable } from '@components';
import { getLoginRedirect, isAuthenticated } from '@middleware';
import { BlogType, blogTextMap } from '@server/entity/type';
import type { BlogSummary } from '@server/dto';

interface Props {
  blogs: BlogSummary[];
}
const Blogs: FunctionComponent<Props> = ({ blogs }) => {
  const [title, setTitle] = useState('');
  const [blogType, setBlogType] = useState(BlogType.COMMON);
  const [context, setContext] = useState('');
  const currentRow = useRef<BlogSummary | null>(null);
  const { setSnackbar, Snackbar } = useSnackbar();
  const { setVisible: setAlertVisible, Alert } = useAlert(deleteBlog);

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
              onChange={(e) => setBlogType(Number(e.target.value) as BlogType)}
            >
              {
                Object.entries(blogTextMap)
                  .map(([key, text]) => <MenuItem key={key} value={Number(key)}>{text}</MenuItem>)
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
            blogType: (row) => blogTextMap[row.blogType],
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

  function detail(row: BlogSummary) {
    location.href = `/manage/blog/${row.id}`;
  }
  function handleDeleteClick(row: BlogSummary) {
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

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect(req),
        permanent: false,
      },
    };
  }

  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blogs = await repo.find({ order: { id: 'DESC' } });

  return {
    props: {
      blogs: blogs.map(({ id, title, blogType }) => ({ id, title, blogType })),
    },
  };
};

export default Blogs;
