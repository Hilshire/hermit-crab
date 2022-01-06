import Link from 'next/link';

export function Header() {
  return (
    <div className="header">
      <ul className="nav">
        <Link href="/"><li>blog</li></Link>
        <Link href="/about-me"><li>About Me</li></Link>
      </ul>
    </div>
  );
}
