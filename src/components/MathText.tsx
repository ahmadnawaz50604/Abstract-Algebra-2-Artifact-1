import katex from 'katex';
import React from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

interface Segment {
  kind: 'text' | 'inline' | 'display';
  content: string;
}

function splitLatexSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', content: input.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('$$') && token.endsWith('$$')) {
      segments.push({ kind: 'display', content: token.slice(2, -2).trim() });
    } else {
      segments.push({ kind: 'inline', content: token.slice(1, -1).trim() });
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < input.length) {
    segments.push({ kind: 'text', content: input.slice(lastIndex) });
  }
  return segments;
}

export const MathText: React.FC<MathTextProps> = ({ text, className }) => {
  const segments = splitLatexSegments(text);
  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.kind === 'text') {
          return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
        }
        const html = katex.renderToString(seg.content, {
          displayMode: seg.kind === 'display',
          throwOnError: false,
          strict: false,
        });
        if (seg.kind === 'display') {
          return (
            <span
              key={idx}
              className="block my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return (
          <span
            key={idx}
            className="inline-block align-middle mx-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
};

export const KatexFormula: React.FC<{
  latex: string;
  display?: boolean;
  className?: string;
}> = ({ latex, display = false, className }) => {
  const html = katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    strict: false,
  });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
