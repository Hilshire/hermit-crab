import {
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

const themeScript = "try{document.documentElement.dataset.theme=localStorage.getItem('theme')==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}";

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
