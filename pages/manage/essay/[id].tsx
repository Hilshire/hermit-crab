import { FunctionComponent, useState } from 'react';
import Markdown from 'react-markdown';
import {
  FormControl, TextField, Button,
} from '@material-ui/core';
import { Essay as EssayEntity } from '@server/entity';
import axios from 'axios';
import { useSnackbar } from '@hooks';
import { getRepo } from '@utils';
import { jwt } from '@middleware';

interface Props {
  essayJson: string;
}
type DetailType = 'edit' | 'preview';
const Essay: FunctionComponent<Props> = ({ essayJson }) => {
  const data: EssayEntity = JSON.parse(essayJson);

  const [type, setType] = useState<DetailType>('preview');
  const [title, setTitle] = useState(data.title);
  const [context, setContext] = useState(data.context);
  const { setSnackbar, Snackbar } = useSnackbar();

  return (
    <div className="essay-detail">
      <Button color="primary" onClick={() => setType(type === 'edit' ? 'preview' : 'edit')}>{type === 'edit' ? 'PREVIEW' : 'EDIT' }</Button>
      { type === 'edit' && <Button color="primary" onClick={handleSubmit}>SUBMIT</Button> }
      <div className="edit-area">
        <div className="edit-section">
          <form>
            <FormControl fullWidth>
              { type === 'edit' ? <TextField id="essay-title" label="essay title" value={title} onChange={(e) => setTitle(e.target.value)} /> : <div>{data.title}</div>}
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
    axios.put(`/api/essay/${data.id}`, { title, context })
      .then((res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }
};

export async function getServerSideProps({ params, req, res }) {
  const repo = await getRepo<EssayEntity>(EssayEntity);
  const essay = await repo.findOne(params.id);
  jwt(() => {})(req, res);

  return {
    props: {
      essayJson: JSON.stringify(essay),
    },
  };
}

export default Essay;
