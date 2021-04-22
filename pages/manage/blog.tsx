import { FunctionComponent, useState, useEffect } from 'react';
import { getConnection, Repository } from 'typeorm';
import { Blog as BlogEntity } from "../../server/entity";
import { getEnv } from "../../util";
import { FormControl, TextField, Button, TableContainer, Table, TableCell, TableRow, TableBody, TableHead  } from '@material-ui/core';
import axios from 'axios';
import { useSnackbar } from '../../hooks/snackbar';

interface Props {
    blogJson: string;
}
const Blog: FunctionComponent<Props> = ({ blogJson }) => {
    const [ title, setTitle ] = useState('')
    const [ context, setContext ] = useState('')
    const { setVisible, setSnackbar, Snackbar } = useSnackbar()

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
        <TableContainer>
            <Table>
                <TableHead>
                    <TableCell>id</TableCell>
                    <TableCell>title</TableCell>
                </TableHead>
                <TableBody>
                    {blogs.map(blog => <TableRow>
                        <TableCell>{blog.id}</TableCell>
                        <TableCell>{blog.title}</TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
        <Snackbar></Snackbar>
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