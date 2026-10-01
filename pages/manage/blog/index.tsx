import { FunctionComponent, useState, useRef } from 'react';
import type { GetServerSideProps } from 'next';
import { getRepo } from '@utils';
import { Blog as BlogEntity, Tag as TagEntity } from '@server/entity';
import {
  TextField, Button, TableCell, Container, MenuItem,
} from '@material-ui/core';
import axios from 'axios';
import { useSnackbar, useAlert } from '@hooks';
import { getLoginRedirect, isAuthenticated } from '@middleware';
import { BlogType, blogTextMap } from '@server/entity/type';
import type { ManagedBlogSummary, TagDto } from '@server/dto';
import { DataTable } from '../../../components/DataTable';
import { ManageNavigation } from '../../../components/ManageNavigation';
import { TagSelector } from '../../../components/TagSelector';

interface Props {
  blogs: ManagedBlogSummary[];
  tags: TagDto[];
}
const Blogs: FunctionComponent<Props> = ({ blogs, tags }) => {
  const [title, setTitle] = useState('');
  const [blogType, setBlogType] = useState(BlogType.COMMON);
  const [context, setContext] = useState('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const currentRow = useRef<ManagedBlogSummary | null>(null);
  const { setSnackbar, Snackbar } = useSnackbar();
  const { setVisible: setAlertVisible, Alert } = useAlert(deleteBlog);

  return (
    <div className="manage">
      <ManageNavigation current="blogs" />
      <Container component="section" className="manage-card">
        <h1>新建文章</h1>
        <form className="manage-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <TextField
            fullWidth
            variant="outlined"
            id="blog-title"
            label="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            select
            fullWidth
            variant="outlined"
            label="文章类型"
            value={blogType}
            onChange={(e) => setBlogType(Number(e.target.value) as BlogType)}
          >
            {
              Object.entries(blogTextMap)
                .map(([key, text]) => <MenuItem key={key} value={Number(key)}>{text}</MenuItem>)
            }
          </TextField>
          <TagSelector id="new-blog-tags" tags={tags} value={tagIds} onChange={setTagIds} />
          <TextField
            fullWidth
            variant="outlined"
            id="blog-content"
            label="文章正文"
            multiline
            minRows={10}
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <div className="form-actions">
            <Button type="submit" color="primary" variant="contained">创建文章</Button>
          </div>
        </form>
      </Container>

      <Container component="section" className="manage-card">
        <h2>已有文章</h2>
        <DataTable
          data={blogs}
          columns={['id', 'title', 'blogType', 'tags']}
          heads={['id', '标题', '类型', '标签']}
          operator={(row) => (
            <TableCell>
              <Button onClick={() => detail(row)}>查看</Button>
              <Button onClick={() => handleDeleteClick(row)}>删除</Button>
            </TableCell>
          )}
          formatter={{
            blogType: (row) => blogTextMap[row.blogType],
            tags: (row) => {
              const rowTags = row.tags || [];
              return rowTags.length === 0 ? '—' : rowTags.map((tag) => (
                <span className="blog-tag" key={tag.id} style={{ backgroundColor: tag.color }}>{tag.name}</span>
              ));
            },
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
      .put('/api/blog', {
        title, context, blogType, tagIds,
      })
      .then((res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }

  function detail(row: ManagedBlogSummary) {
    location.href = `/manage/blog/${row.id}`;
  }
  function handleDeleteClick(row: ManagedBlogSummary) {
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

  const [blogRepo, tagRepo] = await Promise.all([
    getRepo<BlogEntity>(BlogEntity),
    getRepo<TagEntity>(TagEntity),
  ]);
  const [blogs, tags] = await Promise.all([
    blogRepo.find({ relations: { tags: true }, order: { id: 'DESC' } }),
    tagRepo.find({ order: { name: 'ASC' } }),
  ]);

  return {
    props: {
      blogs: blogs.map(({
        id, title, blogType, tags: blogTags,
      }) => ({
        id,
        title,
        blogType,
        tags: (blogTags || []).map(({ id: tagId, name, color }) => ({ id: tagId, name, color })),
      })),
      tags: tags.map(({ id, name, color }) => ({ id, name, color })),
    },
  };
};

export default Blogs;
