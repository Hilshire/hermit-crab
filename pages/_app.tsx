import type { AppProps /* , AppContext */ } from 'next/app';
import axios from 'axios';
import '../styles/globals.scss';
import { useRestoreAppTitle } from '@hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ThemeModeProvider } from '../hooks/useThemeMode';
import { ThemeToggle } from '../components/ThemeToggle';
import { AppLoading } from '../components/AppLoading';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

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

  useRestoreAppTitle();

  return (
    <>
      <Head>
        <link rel="icon" href="/Police_dice.png" />
      </Head>
      <ThemeModeProvider>
        <AppLoading />
        { !isInManage && <Header /> }
        { isInManage && <div className="manage-theme-toggle"><ThemeToggle /></div> }
        <Component {...pageProps} />
        { !isInManage && !isInHome && <Footer /> }
      </ThemeModeProvider>
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
