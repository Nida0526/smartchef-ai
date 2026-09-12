export function FryingPan({ size = 160, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Frying pan with eggs"
    >
      <circle cx="74" cy="70" r="38" stroke="currentColor" strokeWidth="5" />
      <circle cx="74" cy="70" r="24" stroke="currentColor" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />
      <rect x="14" y="66" width="26" height="8" rx="4" fill="currentColor" />
      <ellipse cx="66" cy="61" rx="16" ry="11" stroke="currentColor" strokeWidth="2.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="66" cy="59" r="8" fill="currentColor" />
      <ellipse cx="90" cy="79" rx="9" ry="6" stroke="currentColor" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="90" cy="78" r="4.5" fill="currentColor" />
      <path d="M50 28c3-8 0-14 3-22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 24c3-7 0-12 3-18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="14" r="2.2" fill="currentColor" />
      <circle cx="57" cy="8" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function CookingPot({ size = 160, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cooking pot with steam"
    >
      <path
        d="M28 58h64a10 10 0 0 1 10 10v20a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V68a10 10 0 0 1 10-10Z"
        stroke="currentColor"
        strokeWidth="4.5"
      />
      <rect x="20" y="62" width="9" height="15" rx="4.5" stroke="currentColor" strokeWidth="3.5" />
      <rect x="91" y="62" width="9" height="15" rx="4.5" stroke="currentColor" strokeWidth="3.5" />
      <rect x="26" y="46" width="68" height="12" rx="6" stroke="currentColor" strokeWidth="4" />
      <circle cx="60" cy="38" r="6" fill="currentColor" />
      <path d="M48 26c4-7 0-11 4-17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M62 20c4-6 0-10 3-15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M75 26c4-7 0-11 4-17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="38" cy="14" r="2" fill="currentColor" />
      <circle cx="88" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function UtensilsArt({ size = 160, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Knife, fork and spoon"
    >
      <path
        d="M40 30Q43 15 48 12Q52 15 50 32l0 4H40Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="41.5" y="36" width="7" height="50" rx="3" stroke="currentColor" strokeWidth="3" />
      <path d="M54 40V16m5 24V11m5 29V16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="54.5" y="36" width="5" height="52" rx="2.5" stroke="currentColor" strokeWidth="3" />
      <ellipse cx="77" cy="24" rx="8.5" ry="11.5" stroke="currentColor" strokeWidth="3" />
      <rect x="74" y="35" width="6" height="52" rx="3" stroke="currentColor" strokeWidth="3" />
      <path d="M20 52l3-4 3 4M97 44l3-4 3 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="44" r="1.8" fill="currentColor" />
    </svg>
  );
}