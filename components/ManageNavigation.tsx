import Link from 'next/link';
import { Button, Container } from '@material-ui/core';

interface Props {
  current: 'blogs' | 'tags';
}

export function ManageNavigation({ current }: Props) {
  return (
    <Container component="nav" className="manage-navigation" aria-label="后台管理">
      <Link href="/manage/blog" passHref legacyBehavior>
        <Button component="a" color={current === 'blogs' ? 'primary' : 'default'}>文章</Button>
      </Link>
      <Link href="/manage/tag" passHref legacyBehavior>
        <Button component="a" color={current === 'tags' ? 'primary' : 'default'}>标签</Button>
      </Link>
    </Container>
  );
}
