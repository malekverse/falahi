import Link from 'next/link'

export function Logo({ showSubtitle = true }: { showSubtitle?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3 no-underline">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Filahi logo"
      >
        {/* Olive branch */}
        <path
          d="M6 28C6 28 8 18 14 14C20 10 26 8 30 6"
          stroke="#2d6a4f"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Olive leaf 1 */}
        <ellipse cx="12" cy="20" rx="2.5" ry="5" transform="rotate(-30 12 20)" fill="#40916c" opacity="0.8" />
        {/* Olive leaf 2 */}
        <ellipse cx="18" cy="15" rx="2" ry="4.5" transform="rotate(-20 18 15)" fill="#52b788" opacity="0.8" />
        {/* Olive leaf 3 */}
        <ellipse cx="24" cy="11" rx="1.8" ry="4" transform="rotate(-15 24 11)" fill="#74c69d" opacity="0.8" />
        {/* Wheat stalk */}
        <path
          d="M30 28C30 28 28 18 24 14C20 10 16 8 12 6"
          stroke="#d4a017"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Wheat grain 1 */}
        <ellipse cx="26" cy="18" rx="1.5" ry="3" transform="rotate(20 26 18)" fill="#d4a017" opacity="0.9" />
        {/* Wheat grain 2 */}
        <ellipse cx="22" cy="13" rx="1.3" ry="2.8" transform="rotate(15 22 13)" fill="#e0b02e" opacity="0.9" />
        {/* Wheat grain 3 */}
        <ellipse cx="18" cy="9" rx="1.2" ry="2.5" transform="rotate(10 18 9)" fill="#ecc04a" opacity="0.9" />
        {/* Ground line */}
        <line x1="6" y1="29" x2="30" y2="29" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
        {/* Small root detail */}
        <line x1="18" y1="29" x2="18" y2="32" stroke="#5a5a72" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="14" y1="29" x2="14" y2="31" stroke="#5a5a72" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="22" y1="29" x2="22" y2="31" stroke="#5a5a72" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        {/* Star accent */}
        <polygon
          points="18,22 19,24 21,24 19.5,25.5 20,28 18,26.5 16,28 16.5,25.5 15,24 17,24"
          fill="#d4a017"
          opacity="0.6"
        />
      </svg>
      <div className="flex flex-col">
        <span className="font-display text-lg font-bold leading-none tracking-tight text-olive-900">
          فلاحي
        </span>
        <span className="text-[10px] font-medium leading-none tracking-wider text-ink-500">
          FILAHI
        </span>
      </div>
    </Link>
  )
}
