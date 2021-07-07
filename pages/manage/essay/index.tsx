import { FunctionComponent, useState } from 'react';
import { getRepo } from '@utils';
import { Essay as EssayEntity } from '@server/entity';
import {
  FormControl, TextField, Button, TableCell, Container,
} from '@material-ui/core';
import axios from 'axios';
import { useSnackbar, useAlert } from '@hooks';
import { DataTable } from '@components';

interface Props {
  essaysJson: string;
}
const Essays: FunctionComponent<Props> = ({ essaysJson }) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [currentRow, setCurrentRow] = useState(null);
  const { setSnackbar, Snackbar } = useSnackbar();
  // hook 如果传的是 function 会调用一次，用来获得初始 state。所以这里再包一层
  const { setVisible: setAlertVisible, Alert } = useAlert(() => deleteEssay);

  const essays: EssayEntity[] = JSON.parse(essaysJson);

  return (
    <div className="manage">
      <Container component="section">
        <form>
          <FormControl>
            <TextField id="essay-title" label="essay title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl fullWidth>
            <TextField id="essay-content" label="essay content" multiline value={context} onChange={(e) => setContext(e.target.value)} />
          </FormControl>
        </form>
        <Button color="primary" onClick={submit}>submit</Button>
      </Container>

      <Container component="section">
        <DataTable
          data={essays}
          columns={['id', 'title']}
          heads={['id', 'title']}
          operator={(row) => (
            <TableCell>
              <Button onClick={() => detail(row)}>查看</Button>
              <Button onClick={() => handleDeleteClick(row)}>删除</Button>
            </TableCell>
          )}
        />
      </Container>
      <Snackbar />
      <Alert>
        <div>
          确定要删除
          {currentRow && currentRow.title}
          吗？
        </div>
      </Alert>
    </div>
  );

  function submit() {
    axios
      .put('/api/essay', { title, context })
      .then((res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload.bind(location));
        } else setSnackbar(true, res.data.message || 'ops!', 'error');
      }, (e) => {
        setSnackbar(true, e.message || 'ops!', 'error');
      });
  }

  function detail(row) {
    location.href = `/manage/essay/${row.id}`;
  }
  function handleDeleteClick(row) {
    setAlertVisible(true);
    setCurrentRow(row);
  }
  function deleteEssay() {
    if (!currentRow?.id) return setSnackbar(true, 'no id', 'error');
    const { id } = currentRow;
    axios.delete(`/api/essay/${id}`).then(
      (res) => {
        if (res.data.code) {
          setSnackbar(true, 'ok', 'success', location.reload);
        } else setSnackbar(true, res.data.message || 'ops', 'error');
      },
      () => setSnackbar(true, 'ops', 'error'),
    ).finally(() => setAlertVisible(false));
  }
};

export async function getServerSideProps() {
  const repo = await getRepo<EssayEntity>(EssayEntity);
  const essays = await repo.find();
  return {
    props: {
      essaysJson: JSON.stringify(essays),
    },
  };
}

export default Essays;
