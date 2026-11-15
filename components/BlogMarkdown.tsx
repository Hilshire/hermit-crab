import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { CodeComponent, NormalComponents, SpecialComponents } from 'react-markdown/src/ast-to-react';

const components: Partial<NormalComponents & SpecialComponents> = {
  // @ts-ignore
  code({ node, inline, className, children, ...props }: Parameters<CodeComponent>[0]) {
    const match = /language-(\w+)/.exec(className || '');
    const language = (match && match[1]) || 'javascript';
    return !inline ? (
      <SyntaxHighlighter style={nord} language={language} PreTag="div">
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : <code className={className} {...props}>{children}</code>;
  },
};

export function BlogMarkdown({ content, className }: { content: string; className?: string }) {
  return <ReactMarkdown className={className} components={components}>{content}</ReactMarkdown>;
}
