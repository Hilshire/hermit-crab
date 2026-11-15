import {
  RefObject,
  useEffect,
  useState,
} from 'react';
import type { BlogDetail } from '@server/dto';

interface Props {
  title: string;
  entries: BlogDetail[];
  reverse: boolean;
  bannerRef: RefObject<HTMLElement>;
}

export function SeriesNavigation({
  title,
  entries,
  reverse,
  bannerRef,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [activeEntry, setActiveEntry] = useState<number | null>(null);
  const [label, setLabel] = useState<{ title: string; top: number } | null>(null);

  useEffect(() => {
    if (!entries.length) return undefined;
    const update = () => {
      const banner = bannerRef.current;
      setVisible(!!banner && banner.getBoundingClientRect().bottom <= 0);
      let current: number | null = null;
      const ordered = reverse ? [...entries].reverse() : entries;
      ordered.forEach((entry) => {
        const element = document.getElementById(`blog-${entry.id}`);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.35) {
          current = entry.id;
        }
      });
      setActiveEntry(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [bannerRef, entries, reverse]);

  if (!entries.length || !visible) return null;

  function showLabel(element: HTMLElement, value: string) {
    const rect = element.getBoundingClientRect();
    setLabel({ title: value, top: rect.top + rect.height / 2 });
  }

  function railLink(href: string, value: string, active: boolean) {
    return (
      <a
        key={href}
        href={href}
        className={active ? 'is-active' : ''}
        aria-label={value}
        onMouseEnter={(event) => showLabel(event.currentTarget, value)}
        onMouseLeave={() => setLabel(null)}
        onFocus={(event) => showLabel(event.currentTarget, value)}
        onBlur={() => setLabel(null)}
      >
        <span className="series-rail-line" />
      </a>
    );
  }

  const ordered = reverse ? [...entries].reverse() : entries;
  return (
    <>
      <nav className="series-rail" aria-label="文章导航">
        {railLink('#blog-intro', title, activeEntry === null)}
        {ordered.map((entry) => railLink(`#blog-${entry.id}`, entry.title, activeEntry === entry.id))}
      </nav>
      {label && (
        <div className="series-rail-tooltip" style={{ top: label.top }} aria-hidden="true">
          {label.title}
        </div>
      )}
    </>
  );
}
