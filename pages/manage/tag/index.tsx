import { FunctionComponent, useState, useEffect } from 'react';
import { Tag as TagEntity } from '@server/entity';
import { getRepo } from '@utils';
import {
  Button, Container, FormControl, TextField,
} from '@material-ui/core';
import axios from 'axios';
import { useSnackbar } from '@hooks';
import { jwt } from '@middleware';

interface Props {
  tagsJson: string;
}

const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const Tags: FunctionComponent<Props> = ({ tagsJson }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [inputColor, setInputColor] = useState('');
  const { setSnackbar, Snackbar } = useSnackbar();

  const tags: TagEntity[] = JSON.parse(tagsJson);
  const colorLabel = (color) => <div className="tag-color" style={{ background: `${color}` }} />;
  const refreshColor = () => {
    const color = getRandomColor();
    setColor(color);
    setInputColor(color);
  };

  useEffect(() => {
    refreshColor();
  }, []);

  function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  function safeSetColor(color) {
    if (isValidColor(color)) setColor(color);
  }

  function handleInputColor(v) {
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
            {t.name}
            {' '}
            {colorLabel(t.color)}
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
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }
};

export async function getServerSideProps({ req, res }) {
  const repo = await getRepo<TagEntity>(TagEntity);
  const tags = await repo.find();

  jwt()(req, res);

  return {
    props: {
      tagsJson: JSON.stringify(tags),
    },
  };
}

export default Tags;
