/** Keep the script attached until it finishes: Utterances inserts its iframe beside it. */
export function loadUtterances(
  container: HTMLElement,
  term: string,
  issue: number | null,
  onError: () => void = () => {},
  onReady: () => void = () => {},
  theme: 'photon-dark' | 'github-light' = 'photon-dark',
) {
  const staging = document.createElement('div');
  staging.hidden = true;
  const script = document.createElement('script');
  script.src = 'https://utteranc.es/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('repo', 'Hilshire/hermit-crab');
  if (issue) script.setAttribute('issue-number', String(issue));
  else script.setAttribute('issue-term', term);
  script.setAttribute('theme', theme);

  let cancelled = false;
  let widget: Element | null = null;
  let frame: HTMLIFrameElement | null = null;
  const handleMessage = (event: MessageEvent) => {
    if (!cancelled && event.origin === 'https://utteranc.es' && frame
      && event.source === frame.contentWindow && event.data?.type === 'resize'
      && typeof event.data.height === 'number' && event.data.height > 0) {
      onReady();
    }
  };
  window.addEventListener('message', handleMessage);
  script.onload = () => {
    widget = staging.querySelector('.utterances');
    if (!cancelled && container.isConnected && widget) {
      frame = widget.querySelector('iframe');
      if (frame) frame.setAttribute('loading', 'eager');
      container.appendChild(widget);
    }
    staging.remove();
  };
  script.onerror = () => {
    staging.remove();
    window.removeEventListener('message', handleMessage);
    if (!cancelled) onError();
  };
  staging.appendChild(script);
  document.body.appendChild(staging);

  return () => {
    cancelled = true;
    window.removeEventListener('message', handleMessage);
    if (widget) widget.remove();
    // A pending script must remain attached until its load or error event.
  };
}
