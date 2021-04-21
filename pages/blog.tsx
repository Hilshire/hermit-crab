import { prepareConnection } from'../server/connection'

export default function Blog({ text }) {
    return <div>{text}</div>
}

export async function getStaticProps() {
    await prepareConnection();
    return {
        props: {
            text: '111'
        }
    }
}