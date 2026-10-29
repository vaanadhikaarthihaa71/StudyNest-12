import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content || !content.trim()) {
    return <p className="text-slate-400 italic">No content available.</p>;
  }

  // Pre-split content by code blocks to avoid mangling code
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed text-base">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          return <CodeBlock key={index} rawCode={part} />;
        }
        return <FormattedText key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ rawCode: string }> = ({ rawCode }) => {
  const [copied, setCopied] = useState(false);
  const firstLineEnd = rawCode.indexOf('\n');
  const lang = rawCode.slice(3, firstLineEnd).trim() || 'code';
  const code = rawCode.slice(firstLineEnd + 1, -3).trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 text-slate-100 shadow-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/60 text-xs font-mono text-slate-300">
        <span className="uppercase font-semibold tracking-wider text-indigo-300">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let tableRows: string[] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableRows.length > 0) {
      renderedElements.push(renderTable(tableRows, renderedElements.length));
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection: starts and ends with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (trimmed === '---' || trimmed === '***') {
      renderedElements.push(<hr key={i} className="my-5 border-slate-200" />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={i} className="text-lg font-bold text-slate-900 mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
          {renderInlineStyles(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3 border-b pb-1.5 border-slate-200">
          {renderInlineStyles(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={i} className="text-2xl font-extrabold text-slate-900 mt-6 mb-3">
          {renderInlineStyles(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={i} className="text-base font-semibold text-indigo-950 mt-4 mb-1">
          {renderInlineStyles(trimmed.slice(5))}
        </h4>
      );
      continue;
    }

    // Display Math block $$ ... $$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const mathStr = trimmed.slice(2, -2).trim();
      renderedElements.push(
        <div
          key={i}
          className="my-3 py-3 px-4 bg-indigo-50/60 border border-indigo-100 rounded-xl overflow-x-auto text-center font-mono text-indigo-900 font-medium"
        >
          {cleanMathFormula(mathStr)}
        </div>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={i}
          className="border-l-4 border-indigo-500 bg-indigo-50/40 pl-4 py-2 italic text-slate-700 rounded-r-lg my-3"
        >
          {renderInlineStyles(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered bullet item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      renderedElements.push(
        <div key={i} className="flex items-start gap-2.5 my-1 pl-1">
          <span className="text-indigo-500 font-bold mt-1 text-sm">•</span>
          <div className="flex-1 text-slate-700">{renderInlineStyles(trimmed.slice(2))}</div>
        </div>
      );
      continue;
    }

    // Numbered list item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      renderedElements.push(
        <div key={i} className="flex items-start gap-2.5 my-1.5 pl-1">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0 mt-0.5">
            {numberedMatch[1]}
          </span>
          <div className="flex-1 text-slate-700">{renderInlineStyles(numberedMatch[2])}</div>
        </div>
      );
      continue;
    }

    if (trimmed === '') {
      renderedElements.push(<div key={i} className="h-1.5" />);
      continue;
    }

    renderedElements.push(
      <p key={i} className="text-slate-700 leading-relaxed">
        {renderInlineStyles(line)}
      </p>
    );
  }

  flushTable();

  return <>{renderedElements}</>;
};

function renderTable(rows: string[], keyPrefix: number) {
  if (rows.length < 2) return null;
  const headerCols = rows[0]
    .split('|')
    .map((c) => c.trim())
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  const dataRows = rows
    .slice(2)
    .map((r) =>
      r
        .split('|')
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    );

  return (
    <div key={`table-${keyPrefix}`} className="overflow-x-auto my-4 rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm border-collapse bg-white">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            {headerCols.map((col, cIdx) => (
              <th key={cIdx} className="p-3">
                {renderInlineStyles(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3 text-slate-700">
                  {renderInlineStyles(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cleanMathFormula(formula: string): string {
  // Beautify standard LaTeX constructs into readable unicode symbols for clean presentation
  return formula
    .replace(/\\vec\{([^}]+)\}/g, '$1\u20D7')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\varepsilon_0/g, 'ε₀')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\Phi_E/g, 'Φ_E')
    .replace(/\\oint/g, '∮')
    .replace(/\\int/g, '∫')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\pi/g, 'π')
    .replace(/\\tau/g, 'τ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\circ/g, '°')
    .replace(/\\hat\{n\}/g, 'n̂')
    .replace(/\\propto/g, '∝')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\times/g, '×')
    .replace(/\\rightarrow/g, '→');
}

function renderInlineStyles(text: string): React.ReactNode {
  // Replace inline bold, code, math formulas ($...$), etc.
  // We can tokenize safely
  const tokens = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return (
    <>
      {tokens.map((token, index) => {
        if (!token) return null;

        // Block math within line
        if (token.startsWith('$$') && token.endsWith('$$')) {
          return (
            <span
              key={index}
              className="inline-block px-2 py-0.5 mx-1 font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/70 rounded-md text-sm font-semibold"
            >
              {cleanMathFormula(token.slice(2, -2))}
            </span>
          );
        }

        // Inline math
        if (token.startsWith('$') && token.endsWith('$')) {
          return (
            <span
              key={index}
              className="inline-block px-1.5 py-0.2 mx-0.5 font-mono text-indigo-800 bg-indigo-50/80 rounded border border-indigo-100 text-sm font-medium"
            >
              {cleanMathFormula(token.slice(1, -1))}
            </span>
          );
        }

        // Bold
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={index} className="font-bold text-slate-900">
              {token.slice(2, -2)}
            </strong>
          );
        }

        // Italic
        if (token.startsWith('*') && token.endsWith('*')) {
          return (
            <em key={index} className="italic text-slate-800">
              {token.slice(1, -1)}
            </em>
          );
        }

        // Inline code
        if (token.startsWith('`') && token.endsWith('`')) {
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 border border-slate-200 text-indigo-600 font-mono text-sm"
            >
              {token.slice(1, -1)}
            </code>
          );
        }

        return <span key={index}>{token}</span>;
      })}
    </>
  );
}
