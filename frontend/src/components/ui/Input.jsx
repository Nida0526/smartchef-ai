import { useRef } from 'react';
import { X } from 'lucide-react';

export default function Input({ label, error, hint, suffix, className = '', ...props }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label htmlFor={props.id}>{label}</label>}
      <div className="input-wrap">
        <input className={`form-control ${error ? 'has-error' : ''}`} {...props} />
        {suffix && <div className="input-suffix">{suffix}</div>}
      </div>
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function TagInput({
  tags = [],
  onChange,
  placeholder = 'Add item',
  maxTags = 12
}) {
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const value = raw.trim().replace(/,+$/, '');
    if (!value) return;
    if (tags.includes(value)) return;
    if (tags.length >= maxTags) return;
    onChange([...tags, value]);
  };

  const removeTag = (tag) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(e.currentTarget.value);
      e.currentTarget.value = '';
    } else if (e.key === 'Backspace' && e.currentTarget.value === '' && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleBlur = (e) => {
    addTag(e.currentTarget.value);
    e.currentTarget.value = '';
  };

  return (
    <div className="tag-input" onClick={() => inputRef.current?.focus()}>
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        placeholder={tags.length ? '' : placeholder}
        className="tag-input-field"
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-label={placeholder}
      />
    </div>
  );
}