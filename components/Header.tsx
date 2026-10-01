import { BlogType } from '@server/entity/type';
import Link from 'next/link';

export function Header() {
  return (
    <div className="header">
      <ul className="nav">
        <li><Link href={`/?type=${BlogType.ESSAY}${BlogType.SHOWER_THOUGHTS}`}>杂谈</Link></li>
        <li><Link href="/">blog</Link></li>
        <li><Link href="/about-me">About Me</Link></li>
      </ul>
    </div>
  );
}
