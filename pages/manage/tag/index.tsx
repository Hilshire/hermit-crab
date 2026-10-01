import { FunctionComponent, useState, useEffect } from 'react';
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

interface Props {
  tags: TagDto[];
}

const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

const Tags: FunctionComponent<Props> = ({ tags: initialTags }) => {
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [inputColor, setInputColor] = useState('');
  const { setSnackbar, Snackbar } = useSnackbar();

  const colorLabel = (color: string) => <div className="tag-color" style={{ background: color }} />;
  const refreshColor = () => {
    const color = getRandomColor();
    setColor(color);
    setInputColor(color);
  };

  useEffect(() => {
    refreshColor();
  }, []);

  function isValidColor(color: string) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  function safeSetColor(color: string) {
    if (isValidColor(color)) setColor(color);
  }

  function handleInputColor(v: string) {
    setInputColor(v);
    safeSetColor(v);
  }

  return (
    <div className="manage">
      <Container component="section">
        <form className="tag-add-form">
          <FormControl fullWidth>
            <TextField
              className="tag-name"
              label="tag name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                endAdornment: colorLabel(color),
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField label="color" value={inputColor} onChange={(e) => handleInputColor(e.target.value)} />
          </FormControl>
          <FormControl>
            <Button color="primary" onClick={refreshColor}>Refresh Color</Button>
          </FormControl>

        </form>
        <Button color="primary" onClick={add}>add New</Button>
        <Snackbar />
      </Container>
      <Container component="section">
        {tags.map((t) => (
          <div className="tag-item" key={t.id}>
            <TextField
              value={t.name}
              onChange={(e) => updateTag(t.id, { name: e.target.value })}
            />
            <TextField
              value={t.color}
              onChange={(e) => updateTag(t.id, { color: e.target.value })}
              InputProps={{ endAdornment: colorLabel(t.color) }}
            />
            <Button color="primary" onClick={() => save(t)}>save</Button>
            <Button color="secondary" onClick={() => remove(t.id)}>delete</Button>
          </div>
        ))}
      </Container>
    </div>
  );

  function add() {
    if (!name || !color) return setSnackbar(true, 'bad request', 'error');

    axios
      .put('/api/tag', { name, color })
      .then((res) => {
        if (res.data.code) {
          setTags((tags) => [...tags, res.data.tag]);
          setName('');
          refreshColor();
          setSnackbar(true, 'ok', 'success');
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }

  function updateTag(id: number, changes: Partial<TagDto>) {
    setTags((tags) => tags.map((tag) => (tag.id === id ? { ...tag, ...changes } : tag)));
  }

  function save(tag: TagDto) {
    if (!tag.name || !/^#[0-9a-fA-F]{6}$/.test(tag.color)) {
      return setSnackbar(true, 'bad request', 'error');
    }

    axios.put(`/api/tag/${tag.id}`, { name: tag.name, color: tag.color })
      .then((res) => {
        if (res.data.code) setSnackbar(true, 'ok', 'success');
        else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => setSnackbar(true, e.message || 'ops!', 'error'));
  }

  function remove(id: number) {
    axios.delete(`/api/tag/${id}`).then((res) => {
      if (res.data.code) {
        setTags((tags) => tags.filter((tag) => tag.id !== id));
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
  const tags = await repo.find();

  return {
    props: {
      tags: tags.map(({ id, name, color }) => ({ id, name, color })),
    },
  };
};

export default Tags;
