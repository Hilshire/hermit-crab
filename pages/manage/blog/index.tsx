import { FunctionComponent, useState, useRef } from 'react';
import { IsNull, Not } from 'typeorm';
import { serializeDate } from '@server/dto';
import type { GetServerSideProps } from 'next';
import { getRepo } from '@utils';
import { Blog as BlogEntity, Tag as TagEntity } from '@server/entity';
import {
  TextField, Button, TableCell, Container, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
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
  deletedBlogs: ManagedBlogSummary[];
}
const Blogs: FunctionComponent<Props> = ({ blogs, tags, deletedBlogs }) => {
  const [target, setTarget] = useState<ManagedBlogSummary | null>(null);
  const [existingId, setExistingId] = useState<number | ''>('');
  const [linking, setLinking] = useState(false);
  const [parentId, setParentId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [blogType, setBlogType] = useState(BlogType.COMMON);
  const [context, setContext] = useState('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const currentRow = useRef<ManagedBlogSummary | null>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const { setSnackbar, Snackbar } = useSnackbar();
  const { setVisible: setAlertVisible, Alert } = useAlert(deleteBlog);
  const candidates = blogs.filter((item) => !item.parentId && item.id !== target?.id
    && !blogs.some((child) => child.parentId === item.id)
    && !deletedBlogs.some((child) => child.parentId === item.id));

  return (
    <div className="manage">
      <ManageNavigation current="blogs" />
      <Container component="section" className="manage-card">
        <h1>{parentId ? '新建子帖' : '新建文章'}</h1>
        <form className="manage-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <TextField
            fullWidth
            variant="outlined"
            id="blog-title"
            inputRef={titleInput}
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
          <TextField
            select
            fullWidth
            variant="outlined"
            label="所属主帖"
            value={parentId}
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
            onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <MenuItem value="">独立文章</MenuItem>
            {blogs.filter((item) => !item.parentId).map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>
            ))}
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
          columns={['id', 'title', 'blogType', 'tags', 'parentId']}
          heads={['id', '标题', '类型', '标签', '所属主帖']}
          operator={(row) => (
            <TableCell>
              <Button onClick={() => detail(row)}>查看</Button>
              {!row.parentId && (
                <>
                  <Button onClick={() => addChild(row)}>新建子帖</Button>
                  <Button onClick={() => { setExistingId(''); setTarget(row); }}>添加已有文章</Button>
                </>
              )}
              <Button onClick={() => handleDeleteClick(row)}>删除</Button>
            </TableCell>
          )}
          formatter={{
            parentId: (row) => blogs.find((item) => item.id === row.parentId)?.title || '—',
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
      <Container component="section" className="manage-card">
        <h2>回收站</h2>
        {deletedBlogs.length === 0 ? <p>回收站为空</p> : deletedBlogs.map((item) => (
          <div key={item.id}>
            {item.title}
            {' '}
            {item.parentId ? '（子帖）' : ''}
            {' '}
            <Button onClick={() => restore(item.id)}>恢复</Button>
          </div>
        ))}
      </Container>
      <Dialog open={!!target} onClose={() => { if (!linking) setTarget(null); }} fullWidth maxWidth="sm">
        <DialogTitle>添加已有文章</DialogTitle>
        <DialogContent>
          <p>
            选择一篇独立文章，加入「
            {target?.title}
            」。
          </p>
          {candidates.length ? (
            <TextField
              select
              fullWidth
              variant="outlined"
              label="选择文章"
              value={existingId}
              onChange={(event) => setExistingId(Number(event.target.value))}
            >
              {candidates.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>
              ))}
            </TextField>
          ) : <p>没有可加入的独立文章。</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTarget(null)} disabled={linking}>取消</Button>
          <Button onClick={linkExisting} disabled={!existingId || linking} color="primary">添加</Button>
        </DialogActions>
      </Dialog>
      <Snackbar />
      <Alert>
        <div>
          确定要删除
          {currentRow && currentRow.current?.title}
          吗？
          {currentRow.current && blogs.some((item) => item.parentId === currentRow.current?.id) && ` 将同时删除 ${blogs.filter((item) => item.parentId === currentRow.current?.id).length} 篇子帖。` }
        </div>
      </Alert>
    </div>
  );

  function submit() {
    axios
      .put('/api/blog', {
        title, context, blogType, tagIds, parentId: parentId || null,
      })
      .then((res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }

  function addChild(row: ManagedBlogSummary) {
    setParentId(row.id);
    titleInput.current?.focus();
    titleInput.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function linkExisting() {
    if (!target || !existingId || linking) return;
    setLinking(true);
    try {
      await axios.patch(`/api/blog/${existingId}`, { parentId: target.id });
      setTarget(null);
      setSnackbar(true, '已添加子帖', 'success', location.reload.bind(location));
    } catch (e) {
      const message = axios.isAxiosError(e) ? e.response?.data?.message : null;
      setSnackbar(true, message || '添加失败，请重试', 'error');
    } finally {
      setLinking(false);
    }
  }

  function detail(row: ManagedBlogSummary) {
    location.href = `/manage/blog/${row.id}`;
  }
  function handleDeleteClick(row: ManagedBlogSummary) {
    if (blogs.some((item) => item.parentId === row.id) && !window.confirm(`该主帖及其 ${blogs.filter((item) => item.parentId === row.id).length} 篇子帖将移入回收站，继续吗？`)) return;
    currentRow.current = row;
    setAlertVisible(true);
  }
  function restore(id: number) {
    axios.post(`/api/blog/restore/${id}`).then(() => location.reload()).catch((e) => setSnackbar(true, e.response?.data?.message || '恢复失败', 'error'));
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
  const [blogs, tags, deletedBlogs] = await Promise.all([
    blogRepo.find({ where: { deletedAt: IsNull() }, relations: { tags: true }, order: { id: 'DESC' } }),
    tagRepo.find({ order: { name: 'ASC' } }),
    blogRepo.find({ where: { deletedAt: Not(IsNull()) }, relations: { tags: true }, order: { id: 'DESC' } }),
  ]);

  return {
    props: {
      blogs: blogs.map(({
        id, title, blogType, parentId: blogParentId, tags: blogTags,
      }) => ({
        id,
        title,
        blogType,
        parentId: blogParentId,
        tags: (blogTags || []).map(({ id: tagId, name, color }) => ({ id: tagId, name, color })),
      })),
      deletedBlogs: deletedBlogs.map((item) => ({
        id: item.id,
        title: item.title,
        blogType: item.blogType,
        parentId: item.parentId,
        deletedAt: item.deletedAt ? serializeDate(item.deletedAt) : null,
        tags: [],
      })),
      tags: tags.map(({ id, name, color }) => ({ id, name, color })),
    },
  };
};

export default Blogs;
