export default function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <span
      className="spinner"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size, borderColor: `${color}33`, borderTopColor: color }}
    />
  );
}