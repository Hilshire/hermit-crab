import { FunctionComponent, useState, useEffect } from 'react';
import { getConnection, Repository } from 'typeorm';
import { Blog as BlogEntity } from "../../server/entity";
import { getEnv } from "../../util";
import { FormControl, TextField, Button, TableRow, TableCell } from '@material-ui/core';
import axios from 'axios';
import { useSnackbar, useAlert } from '../../hooks';
import { DataTable } from '../../components'

interface Props {
    blogJson: string;
}
const Blog: FunctionComponent<Props> = ({ blogJson }) => {
    const [ title, setTitle ] = useState('')
    const [ context, setContext ] = useState('')
    const { setSnackbar, Snackbar } = useSnackbar()
    const { setVisible: setAlertVisible, Alert } = useAlert(() => console.log('ok'))

    const blogs: BlogEntity[] = JSON.parse(blogJson);

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
                    <Button onClick={() => deleteBlog(row)}>删除</Button>
                </TableCell>}
        >
        </DataTable>
        <Snackbar></Snackbar>
        <Alert>
            <div>test</div>
        </Alert>
    </div>

    function submit() {
        axios
            .put('/api/blog', { title, context })
            .then(res => {
                if (res.data.code) {
                    setSnackbar(true, 'ok', 'success', location.reload.bind(location));
                }
            }, res => {
                setSnackbar(true, 'ops!', 'error')
            })
    }

    function detail(row) {

    }
    function deleteBlog(row) {

    }
}

export async function getStaticProps() {
    const connection = getConnection(getEnv());
    const blogs = await connection.getRepository<BlogEntity>(BlogEntity).find();

    return {
        props: {
            blogJson: JSON.stringify(blogs)
        }
    }
}

export default Blog