import { FunctionComponent, useState } from 'react';
import { IsNull } from 'typeorm';
import type { GetServerSideProps } from 'next';
import Markdown from 'react-markdown';
import {
  FormControl, TextField, Button, MenuItem,
} from '@material-ui/core';
import { Blog as BlogEntity, Tag as TagEntity } from '@server/entity';
import axios from 'axios';
import { useSnackbar } from '@hooks';
import { getRepo } from '@utils';
import { getLoginRedirect, isAuthenticated } from '@middleware';
import { blogTextMap, BlogType } from '@server/entity/type';
import { serializeBlogDetail } from '@server/dto';
import type { BlogDetail, TagDto } from '@server/dto';
import { TagSelector } from '../../../components/TagSelector';

interface Props {
  blog: BlogDetail;
  tags: TagDto[];
  parents: { id: number; title: string }[];
  hasChildren: boolean;
}
type DetailType = 'edit' | 'preview';
const Blog: FunctionComponent<Props> = ({
  blog: data, tags, parents, hasChildren,
}) => {
  const [commentIssueNumber, setCommentIssueNumber] = useState(data.commentIssueNumber?.toString() || '');
  const [parentId, setParentId] = useState<number | ''>(data.parentId || '');
  const [type, setType] = useState<DetailType>('preview');
  const [blogType, setBlogType] = useState<BlogType>(data.blogType);
  const [title, setTitle] = useState(data.title);
  const [context, setContext] = useState(data.context);
  const [tagIds, setTagIds] = useState<number[]>(data.tags.map((tag) => tag.id));
  const { setSnackbar, Snackbar } = useSnackbar();

  return (
    <div className="blog-detail">
      <Button color="primary" onClick={() => setType(type === 'edit' ? 'preview' : 'edit')}>{type === 'edit' ? 'PREVIEW' : 'EDIT'}</Button>
      {type === 'edit' && <Button color="primary" onClick={handleSubmit}>SUBMIT</Button>}
      <div className="edit-area">
        <div className="edit-section">
          <form>
            <FormControl fullWidth>
              {type === 'edit' ? <TextField id="blog-title" label="blog title" value={title} onChange={(e) => setTitle(e.target.value)} /> : <div>{data.title}</div>}
            </FormControl>
            {type === 'preview' ? blogTextMap[blogType] : (
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
                    .map(([key, text]) => (
                      <MenuItem key={key} value={Number(key)}>{text}</MenuItem>
                    ))
                }
              </TextField>
            )}
            {type === 'edit' && !hasChildren && (
            <TextField
              select
              fullWidth
              label="所属主帖"
              value={parentId}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">独立文章</MenuItem>
              {parents.map((parent) => (
                <MenuItem key={parent.id} value={parent.id}>{parent.title}</MenuItem>
              ))}
            </TextField>
            )}
            {type === 'edit' && (
              <TextField
                fullWidth
                label="评论 Issue 编号（可选）"
                type="number"
                value={commentIssueNumber}
                onChange={(event) => setCommentIssueNumber(event.target.value)}
                helperText="仅在历史评论匹配不正确时填写 GitHub Issue 编号"
                inputProps={{ min: 1, step: 1 }}
              />
            )}
            {type === 'preview' ? (
              <div className="tag-summary">
                标签：
                {data.tags.map((tag) => tag.name).join(', ') || '未选择'}
              </div>
            ) : <TagSelector id="edit-blog-tags" tags={tags} value={tagIds} onChange={setTagIds} />}
            <FormControl fullWidth>
              {
                type === 'preview'
                  ? data.context
                  : (
                    <TextField
                      multiline
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                    />
                  )
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
      <Snackbar />
    </div>
  );

  function handleSubmit() {
    axios.put(`/api/blog/${data.id}`, {
      title,
      context,
      blogType,
      tagIds,
      parentId: parentId || null,
      commentIssueNumber: commentIssueNumber ? Number(commentIssueNumber) : null,
    })
      .then((res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }
};

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async (
  { params, req },
) => {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect(req),
        permanent: false,
      },
    };
  }

  const blogId = Number(params?.id);
  const repo = await getRepo<BlogEntity>(BlogEntity);
  const blog = Number.isInteger(blogId)
    ? await repo.findOne({ where: { id: blogId, deletedAt: IsNull() }, relations: { tags: true } })
    : null;

  if (!blog) {
    return { notFound: true };
  }

  const tagRepo = await getRepo<TagEntity>(TagEntity);
  const tags = await tagRepo.find();
  const parents = await repo.find({ where: { parentId: IsNull(), deletedAt: IsNull() }, select: ['id', 'title'] });
  const hasChildren = (await repo.countBy({ parentId: blog.id })) > 0;

  return {
    props: {
      blog: serializeBlogDetail(blog),
      parents: parents
        .filter((parent) => parent.id !== blog.id)
        .map(({ id, title }) => ({ id, title })),
      hasChildren,
      tags: tags.map(({ id, name, color }) => ({ id, name, color })),
    },
  };
};

export default Blog;
