import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BLOG_PATH_NAME, DEFAULT_APP_TITLE } from '@const';

export function useRestoreAppTitle() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (router.pathname !== BLOG_PATH_NAME) {
      document.title = DEFAULT_APP_TITLE;
    }
  }, [pathname, router]);
}
