import { FunctionComponent, useState, useEffect } from 'react';
import { getConnection, Repository } from 'typeorm';
import { Blog as BlogEntity } from "../../../server/entity";
import { getEnv } from "../../../util";
import { FormControl, TextField, Button, TableRow, TableCell } from '@material-ui/core';
import axios from 'axios';
import { useSnackbar, useAlert } from '../../../hooks';
import { DataTable } from '../../../components'
import { prepareConnection } from 'server/connection'
import Link from 'next/link'

interface Props {
    blogsJson: string;
}
const Blogs: FunctionComponent<Props> = ({ blogsJson }) => {
    const [ title, setTitle ] = useState('')
    const [ context, setContext ] = useState('')
    const [currentRow, setCurrentRow] = useState(null)
    const { setSnackbar, Snackbar } = useSnackbar()
    // hook 如果传的是 function 会调用一次，用来获得初始 state。所以这里再包一层
    const { setVisible: setAlertVisible, Alert } = useAlert(() => deleteBlog)

    const blogs: BlogEntity[] = JSON.parse(blogsJson);

    return <div>
        <form>
            <FormControl>
                <TextField id="blog-title" label="blog title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>
            <FormControl fullWidth>
                <TextField id="blog-content" label="blog content" multiline value={context} onChange={(e) => setContext(e.target.value)} />
            </FormControl>
        </form>
        <Button color="primary" onClick={submit}>submit</Button>
        <DataTable
            data={blogs}
            columns={['id', 'title']}
            heads={['id', 'title']}
            operator={(row) => <TableCell>
                    <Button onClick={() => detail(row)}>查看</Button>
                    <Button onClick={() => handleDeleteClick(row)}>删除</Button>
                </TableCell>}
        >
        </DataTable>
        <Snackbar></Snackbar>
        <Alert>
            <div>确定要删除{currentRow && currentRow.title}吗？</div>
        </Alert>
    </div>

    function submit() {
        axios
            .put('/api/blog', { title, context })
            .then(res => {
                if (res.data.code) {
                    setSnackbar(true, 'ok', 'success', location.reload.bind(location));
                } else setSnackbar(true, res.data.message || 'ops!', 'error')
            }, e => {
                setSnackbar(true, e.message || 'ops!', 'error')
            })
    }

    function detail(row) {
        location.href = '/manage/blog/' + row.id
    }
    function handleDeleteClick(row) {
        setAlertVisible(true)
        setCurrentRow(row)
    }
    function deleteBlog() {
        if (!currentRow?.id) return setSnackbar(true, 'no id', 'error')
        const {id} = currentRow
        axios.delete('/api/blog/' + id).then(
            res => {
                if (res.data.code) {
                    setSnackbar(true, 'ok', 'success', location.reload)
                } else setSnackbar(true, res.data.message || 'ops', 'error')
            },
            res => setSnackbar(true, 'ops', 'error')
        ).finally(() => setAlertVisible(false))
    }
}

export async function getServerSideProps() {
    await prepareConnection();
    const connection = getConnection(getEnv());
    const blogs = await connection.getRepository<BlogEntity>(BlogEntity).find();

    return {
        props: {
            blogsJson: JSON.stringify(blogs)
        }
    }
}

export default Blogs