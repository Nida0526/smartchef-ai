export default function Skeleton({ width = '100%', height = '16px', radius = '8px', style = {}, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}