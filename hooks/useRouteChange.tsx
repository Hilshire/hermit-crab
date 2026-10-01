import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useRouteChange(startcb: () => void, endcb: () => void) {
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeStart', startcb);
    router.events.on('routeChangeComplete', endcb);

    return () => {
      router.events.off('routeChangeStart', startcb);
      router.events.off('routeChangeComplete', endcb);
    };
  }, [endcb, router.events, startcb]);
}
