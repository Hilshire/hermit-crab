import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github, nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { CodeComponent, NormalComponents, SpecialComponents } from 'react-markdown/src/ast-to-react';
import { useThemeMode } from '../hooks/useThemeMode';

function BlogCode({ node, inline, className, children, ...props }: Parameters<CodeComponent>[0]) {
  const { mode } = useThemeMode();
  const match = /language-(\w+)/.exec(className || '');
  const language = (match && match[1]) || 'javascript';
  return !inline ? (
    <SyntaxHighlighter style={mode === 'light' ? github : nord} language={language} PreTag="div">
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : <code className={className} {...props}>{children}</code>;
}

const components: Partial<NormalComponents & SpecialComponents> = {
  // @ts-ignore
  code: BlogCode,
};

export function BlogMarkdown({ content, className }: { content: string; className?: string }) {
  return <ReactMarkdown className={className} components={components}>{content}</ReactMarkdown>;
}
