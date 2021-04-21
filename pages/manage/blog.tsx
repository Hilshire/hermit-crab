import { prepareConnection } from "../../server/connection";
import { FunctionComponent } from 'react';
import { getConnection, Repository } from 'typeorm';
import { Blog as BlogEntity } from "../../server/entity";
import { getEnv } from "../../util";

interface Props {
    blogJson: string;
}
const Blog: FunctionComponent<Props> = ({blogJson}) => {
    const blogs: BlogEntity[] = JSON.parse(blogJson);
    return <div>
        { blogs.map(i => <div>{i.title}</div>)}
            <input name="title"></input>
            <input name="context"></input>
            <button onClick={ submit }>submit</button>
    </div>

    function submit() {
        console.log('submit')
    }
}

export async function getStaticProps() {
    await prepareConnection();
    const connection = getConnection(getEnv());
    const blogs = await connection.getRepository<BlogEntity>(BlogEntity).find();
    
    return {
        props: {
            blogJson: JSON.stringify(blogs)
        }
    }
}

export default Blog