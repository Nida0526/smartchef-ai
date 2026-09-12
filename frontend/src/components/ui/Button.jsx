import Spinner from './Spinner';

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, children, className = '', ...props }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}