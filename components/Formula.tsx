import katex from 'katex';

interface FormulaProps {
  tex: string;
}

export function Formula({ tex }: FormulaProps) {
  let renderedHtml = '';
  try {
    renderedHtml = katex.renderToString(tex, {
      throwOnError: false,
      output: 'htmlAndMathml',
      trust: false,
      strict: 'warn',
    });
  } catch {
    return <span className="formula formula-error">{tex}</span>;
  }

  return (
    <span
      className="formula"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
