import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Customize rendering of specific elements
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-gray-800 dark:text-gray-200">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800 dark:text-gray-200">
              {children}
            </li>
          ),
          code: ({ inline, children }) => (
            inline ? (
              <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                {children}
              </code>
            ) : (
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                <code>{children}</code>
              </pre>
            )
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};