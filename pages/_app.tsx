import type { AppProps /* , AppContext */ } from 'next/app';
import axios from 'axios';
import '../styles/globals.scss';
import { Header, Footer } from '@components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

const darkTheme = createTheme({
  palette: {
    type: 'dark',
  },
});
// axios
axios.interceptors.response.use((res) => {
  if (/(.+)?application\/json(.+)?/.exec(res.headers['content-type'])) {
    try {
      if (res.data?.code === 2) {
        setTimeout(() => {
          location.href = res.data?.location;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
  return res;
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isInHome = router.pathname === '/';
  const isInManage = /^\/?manage/.exec(router.pathname);

  return (
    <>
      <Head>
        <title>hilshire&apos;s blog</title>
        <link rel="icon" href="/Police_dice.png" />
      </Head>
      <ThemeProvider theme={darkTheme}>
        { !isInManage && <Header /> }
        <Component {...pageProps} />
        { !isInManage && !isInHome && <Footer /> }
      </ThemeProvider>
    </>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext: AppContext) => {
// calls page's `getInitialProps` and fills `appProps.pageProps`
// const appProps = await App.getInitialProps(appContext);
// return { ...appProps }
// }

export default MyApp;
