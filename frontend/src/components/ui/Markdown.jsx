import { parseInline, splitBlocks } from '../../utils/markdown';

function Inline({ content }) {
  const tokens = parseInline(content);
  return tokens.map((token, i) => {
    switch (token.type) {
      case 'bold':
        return <strong key={i}>{token.content}</strong>;
      case 'italic':
        return <em key={i}>{token.content}</em>;
      case 'code':
        return <code key={i}>{token.content}</code>;
      case 'link':
        return (
          <a key={i} href={token.url} target="_blank" rel="noopener noreferrer">
            {token.text}
          </a>
        );
      default:
        return <span key={i}>{token.content}</span>;
    }
  });
}

function ListBlock({ type, items }) {
  const children = items.map((item, i) => (
    <li key={i}><Inline content={item.content} /></li>
  ));
  return type === 'numbered' ? <ol className="md-ol">{children}</ol> : <ul className="md-ul">{children}</ul>;
}

export default function Markdown({ text }) {
  const blocks = splitBlocks(text || '');

  const rendered = [];
  let listBuffer = [];
  let listType = null;

  const flushList = (key) => {
    if (listBuffer.length) {
      rendered.push(<ListBlock key={key} type={listType} items={listBuffer} />);
      listBuffer = [];
      listType = null;
    }
  };

  blocks.forEach((block, i) => {
    if (block.type === 'bullet' || block.type === 'numbered') {
      if (listType && listType !== block.type) {
        flushList(`l-${i}`);
      }
      listType = block.type;
      listBuffer.push(block);
      return;
    }

    flushList(`l-${i}`);
    switch (block.type) {
      case 'heading':
        rendered.push(
          block.level === 1
            ? <h3 key={i}><Inline content={block.content} /></h3>
            : <h4 key={i}><Inline content={block.content} /></h4>
        );
        break;
      case 'quote':
        rendered.push(<blockquote key={i}><Inline content={block.content} /></blockquote>);
        break;
      case 'code':
        rendered.push(<pre className="md-code" key={i}>{block.content}</pre>);
        break;
      case 'hr':
        rendered.push(<hr key={i} />);
        break;
      default:
        rendered.push(<p key={i} className="md-p"><Inline content={block.content} /></p>);
    }
  });

  flushList(`l-end`);

  return <>{rendered}</>;
}