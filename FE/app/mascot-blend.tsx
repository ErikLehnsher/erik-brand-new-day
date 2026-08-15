type MascotProps = {
  kind: "cat" | "dog";
  className?: string;
};

export function MascotBlend({ kind, className }: MascotProps) {
  if (kind === "cat") {
    return (
      <svg viewBox="0 0 260 320" className={className} aria-hidden="true">
        <defs>
          <filter id="soft-cat-shadow" x="-20%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="12" dy="20" stdDeviation="5" floodColor="rgba(45, 18, 10, 0.38)" />
          </filter>
        </defs>
        <g filter="url(#soft-cat-shadow)">
          <ellipse cx="130" cy="290" rx="72" ry="14" fill="rgba(45, 18, 10, 0.18)" />
          <path d="M78 76 L62 24 L104 58 L130 22 L156 58 L198 24 L182 76" fill="#d8a63b" />
          <path
            d="M78 76 L62 24 L104 58 L130 22 L156 58 L198 24 L182 76"
            fill="none"
            stroke="#7b2a1f"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <ellipse cx="130" cy="168" rx="82" ry="110" fill="#f7ecd8" stroke="#7b2a1f" strokeWidth="5" />
          <ellipse cx="98" cy="130" rx="18" ry="22" fill="#fff9eb" stroke="#7b2a1f" strokeWidth="4" />
          <ellipse cx="162" cy="130" rx="18" ry="22" fill="#fff9eb" stroke="#7b2a1f" strokeWidth="4" />
          <ellipse cx="130" cy="156" rx="30" ry="28" fill="#f7ecd8" stroke="#7b2a1f" strokeWidth="5" />
          <circle cx="116" cy="152" r="6" fill="#241610" />
          <circle cx="144" cy="152" r="6" fill="#241610" />
          <path d="M124 168 L130 172 L136 168 L130 178 Z" fill="#c65628" />
          <path d="M105 190 Q130 208 155 190" fill="none" stroke="#7b2a1f" strokeWidth="4" strokeLinecap="round" />
          <path d="M54 178 Q22 184 18 206" fill="none" stroke="#7b2a1f" strokeWidth="4" strokeLinecap="round" />
          <path d="M206 178 Q238 184 242 206" fill="none" stroke="#7b2a1f" strokeWidth="4" strokeLinecap="round" />
          <path d="M88 218 Q82 260 92 286" fill="none" stroke="#7b2a1f" strokeWidth="7" strokeLinecap="round" />
          <path d="M172 218 Q178 260 168 286" fill="none" stroke="#7b2a1f" strokeWidth="7" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 260 320" className={className} aria-hidden="true">
      <defs>
        <filter id="soft-dog-shadow" x="-20%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="12" dy="20" stdDeviation="5" floodColor="rgba(45, 18, 10, 0.38)" />
        </filter>
      </defs>
      <g filter="url(#soft-dog-shadow)">
        <ellipse cx="130" cy="290" rx="74" ry="14" fill="rgba(45, 18, 10, 0.18)" />
        <path d="M68 72 Q72 34 94 24 Q110 40 110 70" fill="#efc646" stroke="#7b2a1f" strokeWidth="5" />
        <path d="M192 72 Q188 34 166 24 Q150 40 150 70" fill="#efc646" stroke="#7b2a1f" strokeWidth="5" />
        <ellipse cx="130" cy="168" rx="84" ry="112" fill="#f7ecd8" stroke="#7b2a1f" strokeWidth="5" />
        <ellipse cx="130" cy="124" rx="38" ry="32" fill="#f7ecd8" stroke="#7b2a1f" strokeWidth="5" />
        <circle cx="110" cy="122" r="7" fill="#241610" />
        <circle cx="150" cy="122" r="7" fill="#241610" />
        <path d="M120 142 Q130 150 140 142" fill="none" stroke="#c65628" strokeWidth="5" strokeLinecap="round" />
        <path d="M86 192 Q104 214 98 242" fill="none" stroke="#7b2a1f" strokeWidth="7" strokeLinecap="round" />
        <path d="M174 192 Q156 214 162 242" fill="none" stroke="#7b2a1f" strokeWidth="7" strokeLinecap="round" />
        <path d="M102 174 Q130 192 158 174" fill="none" stroke="#7b2a1f" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
