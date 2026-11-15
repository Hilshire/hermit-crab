/* eslint-disable no-param-reassign, class-methods-use-this */
import { loadUtterances } from '../../components/utterances/loadUtterances';

class FakeElement {
  children: FakeElement[] = [];

  parent: FakeElement | null = null;

  className = '';

  tagName = '';

  contentWindow = {};

  hidden = false;

  isConnected = true;

  onload: (() => void) | null = null;

  onerror: (() => void) | null = null;

  appendChild(child: FakeElement) {
    child.remove();
    child.parent = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }

  setAttribute() {}

  querySelector(selector: string) {
    return this.children.find((child) => `.${child.className}` === selector
      || child.tagName === selector) || null;
  }
}

describe('Utterances script lifecycle', () => {
  let body: FakeElement;
  let container: FakeElement;
  let created: FakeElement[];
  let handler: ((event: Partial<MessageEvent>) => void) | undefined;

  beforeEach(() => {
    body = new FakeElement();
    container = new FakeElement();
    created = [];
    handler = undefined;
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: {
        addEventListener: (_: string, listener: typeof handler) => { handler = listener; },
        removeEventListener: () => { handler = undefined; },
      },
    });
    Object.defineProperty(global, 'document', {
      configurable: true,
      value: {
        body,
        createElement: () => {
          const element = new FakeElement();
          created.push(element);
          return element;
        },
      },
    });
  });
  afterEach(() => {
    delete (global as { document?: unknown }).document;
    delete (global as { window?: unknown }).window;
  });

  it('keeps a pending script attached after the comment section closes', () => {
    const cleanup = loadUtterances(container as unknown as HTMLElement, 'post', null);
    const [staging, script] = created;
    cleanup();
    expect(staging.parent).toBe(body);
    expect(script.parent).toBe(staging);
    const widget = new FakeElement();
    widget.className = 'utterances';
    staging.appendChild(widget);
    script.onload!();
    expect(staging.parent).toBeNull();
    expect(container.children).toHaveLength(0);
  });

  it('moves the loaded widget into the open section and removes it on cleanup', () => {
    const cleanup = loadUtterances(container as unknown as HTMLElement, 'post', 42);
    const [staging, script] = created;
    const widget = new FakeElement();
    widget.className = 'utterances';
    staging.appendChild(widget);
    script.onload!();
    expect(container.children).toEqual([widget]);
    expect(staging.parent).toBeNull();
    cleanup();
    expect(container.children).toHaveLength(0);
  });
  it('waits for a resize message from the correct Utterances frame', () => {
    const ready = jest.fn();
    const cleanup = loadUtterances(container as unknown as HTMLElement, 'post', null, () => {}, ready);
    const [staging, script] = created;
    const widget = new FakeElement();
    widget.className = 'utterances';
    const frame = new FakeElement();
    frame.tagName = 'iframe';
    widget.appendChild(frame);
    staging.appendChild(widget);
    script.onload!();
    handler!({ origin: 'https://utteranc.es', source: {} as Window, data: { type: 'resize', height: 300 } });
    expect(ready).not.toHaveBeenCalled();
    handler!({ origin: 'https://utteranc.es', source: frame.contentWindow as Window, data: { type: 'resize', height: 300 } });
    expect(ready).toHaveBeenCalledTimes(1);
    cleanup();
  });
});
