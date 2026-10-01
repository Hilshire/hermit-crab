import { FunctionComponent, useState } from 'react';
import type { GetServerSideProps } from 'next';
import { Tag as TagEntity } from '@server/entity';
import { getRepo } from '@utils';
import {
  Button, Container, FormControl, TextField,
} from '@material-ui/core';
import axios from 'axios';
import { useSnackbar } from '@hooks';
import { getLoginRedirect, isAuthenticated } from '@middleware';
import type { TagDto } from '@server/dto';
import { ManageNavigation } from '../../../components/ManageNavigation';
import { DEFAULT_TAG_COLORS, TagColorPicker } from '../../../components/TagColorPicker';

interface Props {
  tags: TagDto[];
}

const Tags: FunctionComponent<Props> = ({ tags: initialTags }) => {
  const [tags, setTags] = useState(initialTags);
  const [savedTags, setSavedTags] = useState(initialTags);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_TAG_COLORS[0]);
  const { setSnackbar, Snackbar } = useSnackbar();

  return (
    <div className="manage">
      <ManageNavigation current="tags" />
      <Container component="section" className="manage-card">
        <h1>标签管理</h1>
        <form className="tag-add-form" onSubmit={(event) => { event.preventDefault(); add(); }}>
          <FormControl fullWidth>
            <TextField
              className="tag-name"
              label="标签名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth>
            <TagColorPicker value={color} onChange={setColor} />
          </FormControl>
          <div className="form-actions">
            <Button type="submit" color="primary" variant="contained">新增标签</Button>
          </div>
        </form>
      </Container>
      <Container component="section" className="manage-card">
        <h2>已有标签</h2>
        {tags.length === 0 ? <p>还没有标签。创建后可在新建或编辑文章时选择。</p> : tags.map((tag) => (
          <form className="tag-item" key={tag.id} onSubmit={(event) => { event.preventDefault(); save(tag); }}>
            <TextField
              label="名称"
              value={tag.name}
              onChange={(e) => updateTag(tag.id, { name: e.target.value })}
            />
            <TagColorPicker value={tag.color} onChange={(color) => updateTag(tag.id, { color })} />
            <div className="form-actions">
              {hasChanges(tag) && <Button type="submit" color="primary">保存修改</Button>}
              <Button type="button" color="secondary" onClick={() => remove(tag.id)}>删除</Button>
            </div>
          </form>
        ))}
      </Container>
      <Snackbar />
    </div>
  );

  function add() {
    if (!name || !color) return setSnackbar(true, 'bad request', 'error');

    axios
      .put('/api/tag', { name, color })
      .then((res) => {
        if (res.data.code) {
          setTags((tags) => [...tags, res.data.tag]);
          setSavedTags((tags) => [...tags, res.data.tag]);
          setName('');
          setColor(DEFAULT_TAG_COLORS[0]);
          setSnackbar(true, 'ok', 'success');
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }

  function updateTag(id: number, changes: Partial<TagDto>) {
    setTags((tags) => tags.map((tag) => (tag.id === id ? { ...tag, ...changes } : tag)));
  }

  function hasChanges(tag: TagDto) {
    const savedTag = savedTags.find(({ id }) => id === tag.id);
    return !savedTag || savedTag.name !== tag.name || savedTag.color !== tag.color;
  }

  function save(tag: TagDto) {
    if (!tag.name || !/^#[0-9a-fA-F]{6}$/.test(tag.color)) {
      return setSnackbar(true, 'bad request', 'error');
    }

    axios.put(`/api/tag/${tag.id}`, { name: tag.name, color: tag.color })
      .then((res) => {
        if (res.data.code) {
          setSavedTags((tags) => tags.map((savedTag) => (savedTag.id === tag.id ? tag : savedTag)));
          setSnackbar(true, 'ok', 'success');
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => setSnackbar(true, e.message || 'ops!', 'error'));
  }

  function remove(id: number) {
    axios.delete(`/api/tag/${id}`).then((res) => {
      if (res.data.code) {
        setTags((tags) => tags.filter((tag) => tag.id !== id));
        setSavedTags((tags) => tags.filter((tag) => tag.id !== id));
        setSnackbar(true, 'ok', 'success');
      } else setSnackbar(true, res.data.message || 'ops!', 'error');
    }, (e) => setSnackbar(true, e.message || 'ops!', 'error'));
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

  const repo = await getRepo<TagEntity>(TagEntity);
  const tags = await repo.find({ order: { name: 'ASC' } });

  return {
    props: {
      tags: tags.map(({ id, name, color }) => ({ id, name, color })),
    },
  };
};

export default Tags;
