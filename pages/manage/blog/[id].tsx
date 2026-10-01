import { FunctionComponent, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Markdown from 'react-markdown';
import {
  FormControl, TextField, Button, Select, MenuItem,
} from '@material-ui/core';
import { Blog as BlogEntity, Tag as TagEntity } from '@server/entity';
import axios from 'axios';
import { useSnackbar } from '@hooks';
import { getRepo } from '@utils';
import { getLoginRedirect, isAuthenticated } from '@middleware';
import { blogTextMap, BlogType } from '@server/entity/type';
import type { BlogDetail, TagDto } from '@server/dto';

interface Props {
  blog: BlogDetail;
  tags: TagDto[];
}
type DetailType = 'edit' | 'preview';
const Blog: FunctionComponent<Props> = ({ blog: data, tags }) => {
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
            <FormControl fullWidth>
              {type === 'preview' ? blogTextMap[blogType] : (
                <Select
                  labelId="Blog Type"
                  value={blogType}
                  onChange={(e) => setBlogType(Number(e.target.value) as BlogType)}
                >
                  {
                    Object.entries(blogTextMap)
                      .map(([key, text]) => (
                        <MenuItem key={key} value={Number(key)}>{text}</MenuItem>
                      ))
                  }
                </Select>
              )}
            </FormControl>
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
            <FormControl fullWidth>
              {type === 'preview' ? (
                <div>{data.tags.map((tag) => tag.name).join(', ') || 'No tags'}</div>
              ) : (
                <Select
                  multiple
                  value={tagIds}
                  onChange={(e) => {
                    const { value } = e.target;
                    setTagIds(typeof value === 'string' ? value.split(',').map(Number) : value as number[]);
                  }}
                  renderValue={(selected) => {
                    const selectedTagIds = selected as number[];
                    return tags.filter((tag) => selectedTagIds.includes(tag.id)).map((tag) => tag.name).join(', ');
                  }}
                >
                  {tags.map((tag) => <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>)}
                </Select>
              )}
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
    ? await repo.findOne({ where: { id: blogId }, relations: { tags: true } })
    : null;

  if (!blog) {
    return { notFound: true };
  }

  const tagRepo = await getRepo<TagEntity>(TagEntity);
  const tags = await tagRepo.find();

  return {
    props: {
      blog: {
        id: blog.id,
        title: blog.title,
        context: blog.context,
        blogType: blog.blogType,
        createAt: blog.createAt,
        lastUpdateAt: blog.lastUpdateAt,
        tags: blog.tags.map(({ id, name, color }) => ({ id, name, color })),
      },
      tags: tags.map(({ id, name, color }) => ({ id, name, color })),
    },
  };
};

export default Blog;
